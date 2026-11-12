import type { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "@/lib/errors/ValidationError";
import type { FileMetadataInput, SignedUploadUrlItem } from "./createSignedUploadUrlsAction";

export async function generateSingleSignedUploadUrl(
  admin: SupabaseClient,
  bucket: string,
  schoolId: string,
  folder: string | undefined,
  file: FileMetadataInput,
): Promise<SignedUploadUrlItem> {
  const cleanName = file.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const folderSegment = folder ? `${folder}/` : "";
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const storagePath = `${schoolId}/${folderSegment}${Date.now()}_${randomSuffix}_${cleanName}`;

  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(storagePath, { upsert: true });

  if (error || !data) {
    throw new ValidationError(error?.message || `Failed to create upload URL for ${file.fileName}`);
  }

  return {
    fileName: file.fileName,
    storagePath: data.path,
    signedUrl: data.signedUrl,
    token: data.token,
  };
}
