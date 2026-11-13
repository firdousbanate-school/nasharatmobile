import { createStorageUploadUrlAction } from "@/actions/backup/createStorageUploadUrlAction";
import { inferStorageMimeType } from "@/lib/storage/inferStorageMimeType";
import { createSupabaseBrowserClient } from "@/lib/supabase/createSupabaseBrowserClient";
import type { ExtractedStorageFile } from "./extractStorageFilesFromZip";

/**
 * Uploads storage files extracted from the backup archive directly to Supabase
 * Storage via pre-signed upload URLs. Bypasses server action payload limits and
 * guarantees individual file errors never crash the database restore.
 */
export async function uploadRestoredStorageFiles(
  storageFiles: ExtractedStorageFile[],
): Promise<number> {
  if (storageFiles.length === 0) return 0;

  const supabase = createSupabaseBrowserClient();
  let restoredCount = 0;

  for (const sf of storageFiles) {
    try {
      const urlRes = await createStorageUploadUrlAction({
        bucket: sf.bucket,
        path: sf.path,
      });

      if (!urlRes.success || !urlRes.token) {
        console.warn(`Could not get signed upload URL for ${sf.path}:`, urlRes.error);
        continue;
      }

      const contentType = inferStorageMimeType(sf.path, sf.file.type);
      const { error } = await supabase.storage
        .from(sf.bucket)
        .uploadToSignedUrl(sf.path, urlRes.token, sf.file, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.warn(`Failed to upload ${sf.path} to signed URL:`, error.message);
        continue;
      }

      restoredCount++;
    } catch (err) {
      console.warn(`Error restoring storage file ${sf.path}:`, err);
    }
  }

  return restoredCount;
}
