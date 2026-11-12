import { createSignedUploadUrlsAction } from "@/actions/storage/createSignedUploadUrlsAction";
import { uploadSingleFileDirect } from "./uploadSingleFileDirect";

export interface UploadedFileRecord {
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadMultipleFilesResult {
  ok: boolean;
  uploaded: UploadedFileRecord[];
  error?: string;
}

export async function uploadMultipleFilesDirectly({
  bucket,
  folder,
  files,
}: {
  bucket:
    | "circular-attachments"
    | "maintenance-photos"
    | "achievement-attachments"
    | "school-documents"
    | "public-assets";
  folder?: string;
  files: File[];
}): Promise<UploadMultipleFilesResult> {
  if (!files?.length) {
    return { ok: true, uploaded: [] };
  }

  const urlRes = await createSignedUploadUrlsAction({
    bucket,
    folder,
    files: files.map((f) => ({
      fileName: f.name,
      fileSize: f.size,
      mimeType: f.type || "application/octet-stream",
    })),
  });

  if (!urlRes.success || !urlRes.items) {
    return { ok: false, uploaded: [], error: urlRes.error || "Failed to generate upload tokens" };
  }

  const uploadedRecords: UploadedFileRecord[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const res = await uploadSingleFileDirect({ bucket, file, item: urlRes.items[i] });

    if (!res.ok) {
      return { ok: false, uploaded: uploadedRecords, error: res.error };
    }

    uploadedRecords.push(res.record);
  }

  return { ok: true, uploaded: uploadedRecords };
}
