import { createSupabaseBrowserClient } from "@/lib/supabase/createSupabaseBrowserClient";
import { createDocumentUploadUrlAction } from "@/actions/documents/createDocumentUploadUrlAction";
import type { SchoolDocumentSlug } from "@/lib/documents/types";

export interface DirectUploadParams {
  slug: SchoolDocumentSlug;
  file: File;
}

export interface DirectUploadResult {
  ok: boolean;
  filePath?: string;
  error?: string;
}

export async function uploadDocumentDirectToStorage({
  slug,
  file,
}: DirectUploadParams): Promise<DirectUploadResult> {
  const urlRes = await createDocumentUploadUrlAction({
    slug,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/pdf",
  });

  if (!urlRes.success) {
    return { ok: false, error: urlRes.error || "Failed to prepare upload" };
  }

  const { path, token } = urlRes;
  const supabase = createSupabaseBrowserClient();

  const { error: uploadError } = await supabase.storage
    .from("school-documents")
    .uploadToSignedUrl(path, token, file, {
      contentType: file.type || "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  return { ok: true, filePath: path };
}
