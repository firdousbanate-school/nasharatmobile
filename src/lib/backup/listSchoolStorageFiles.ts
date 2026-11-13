import type { SupabaseClient } from "@supabase/supabase-js";

export type StorageFileEntry = {
  bucket: string;
  path: string;
  signedUrl: string;
  size: number;
};

const BUCKETS = [
  "public-assets",
  "school-documents",
  "circular-attachments",
  "maintenance-photos",
] as const;

async function listFolderFiles(
  admin: SupabaseClient,
  bucket: string,
  prefix: string,
): Promise<StorageFileEntry[]> {
  const { data: items, error } = await admin.storage.from(bucket).list(prefix);
  if (error || !items) {
    return [];
  }

  const results: StorageFileEntry[] = [];

  for (const item of items) {
    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

    if (!item.id) {
      // It is a subfolder, recurse
      const nested = await listFolderFiles(admin, bucket, itemPath);
      results.push(...nested);
    } else {
      const { data: signed } = await admin.storage.from(bucket).createSignedUrl(itemPath, 3600);

      if (signed?.signedUrl) {
        results.push({
          bucket,
          path: itemPath,
          signedUrl: signed.signedUrl,
          size: (item.metadata?.size as number) ?? 0,
        });
      }
    }
  }

  return results;
}

/**
 * Discovers and signs all physical storage files belonging to a school tenant.
 */
export async function listSchoolStorageFiles(
  admin: SupabaseClient,
  schoolId: string,
): Promise<StorageFileEntry[]> {
  const allEntries: StorageFileEntry[] = [];

  for (const bucket of BUCKETS) {
    const entries = await listFolderFiles(admin, bucket, schoolId);
    allEntries.push(...entries);
  }

  return allEntries;
}
