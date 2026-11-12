import type { SupabaseClient } from "@supabase/supabase-js";
import { validateFileUpdateParams } from "./validateFileUpdateParams";

export interface BuildUpdateDocumentPayloadParams {
  admin: SupabaseClient;
  schoolId: string;
  slug: string;
  title: string;
  description?: string | null;
  existingFilePath?: string | null;
  fileUpdate?: {
    filePath: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
}

export async function buildUpdateDocumentPayload({
  admin,
  schoolId,
  slug,
  title,
  description,
  existingFilePath,
  fileUpdate,
}: BuildUpdateDocumentPayloadParams): Promise<Record<string, unknown>> {
  const payload: Record<string, unknown> = {
    title,
    description: description?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (fileUpdate) {
    validateFileUpdateParams(schoolId, slug, fileUpdate);
    payload.file_path = fileUpdate.filePath;
    payload.file_name = fileUpdate.fileName;
    payload.file_size = fileUpdate.fileSize;
    payload.mime_type = fileUpdate.mimeType;

    if (existingFilePath && existingFilePath !== fileUpdate.filePath) {
      await admin.storage.from("school-documents").remove([existingFilePath]);
    }
  }

  return payload;
}
