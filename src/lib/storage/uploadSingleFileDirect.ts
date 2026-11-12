import { uploadFileDirectToStorage } from "./uploadFileDirectToStorage";
import type { UploadedFileRecord } from "./uploadMultipleFilesDirectly";

interface UploadSingleFileInput {
  bucket:
    | "circular-attachments"
    | "maintenance-photos"
    | "achievement-attachments"
    | "school-documents"
    | "public-assets";
  file: File;
  item?: { storagePath: string; token: string };
}

export async function uploadSingleFileDirect({
  bucket,
  file,
  item,
}: UploadSingleFileInput): Promise<
  { ok: true; record: UploadedFileRecord } | { ok: false; error: string }
> {
  if (!item) {
    return { ok: false, error: `${file.name}: Upload slot missing` };
  }

  const res = await uploadFileDirectToStorage({
    bucket,
    storagePath: item.storagePath,
    token: item.token,
    file,
  });

  if (!res.ok) {
    return {
      ok: false,
      error: `${file.name}: ${res.error || "Upload failed"}`,
    };
  }

  return {
    ok: true,
    record: {
      path: item.storagePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
    },
  };
}
