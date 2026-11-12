import { createSupabaseBrowserClient } from "@/lib/supabase/createSupabaseBrowserClient";

export interface DirectStorageUploadItem {
  bucket:
    | "circular-attachments"
    | "maintenance-photos"
    | "achievement-attachments"
    | "school-documents"
    | "public-assets";
  storagePath: string;
  token: string;
  file: File;
}

export interface DirectStorageUploadResult {
  ok: boolean;
  path?: string;
  error?: string;
}

export async function uploadFileDirectToStorage({
  bucket,
  storagePath,
  token,
  file,
}: DirectStorageUploadItem): Promise<DirectStorageUploadResult> {
  const supabase = createSupabaseBrowserClient();

  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(storagePath, token, file, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, path: storagePath };
}
