import { uploadDocumentDirectToStorage } from "@/lib/documents/uploadDocumentDirectToStorage";
import { saveDirectDocumentAction } from "@/actions/documents/saveDirectDocumentAction";
import type { ActionResult } from "@/lib/errors/formatActionErrorResult";
import type { SchoolDocumentSlug } from "@/lib/documents/types";

export interface CreateNewDocumentDirectParams {
  slug: SchoolDocumentSlug;
  title: string;
  description: string;
  file: File | null;
}

export async function submitNewDocumentDirect({
  slug,
  title,
  description,
  file,
}: CreateNewDocumentDirectParams): Promise<ActionResult> {
  if (!file) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      error: "Document file is required",
    };
  }

  const upload = await uploadDocumentDirectToStorage({ slug, file });
  if (!upload.ok || !upload.filePath) {
    return {
      success: false,
      code: "STORAGE_UPLOAD_ERROR",
      error: upload.error || "File upload failed",
    };
  }

  return saveDirectDocumentAction({
    slug,
    title: title.trim(),
    description: description.trim() || null,
    filePath: upload.filePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || "application/pdf",
  });
}
