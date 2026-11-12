import { uploadDocumentDirectToStorage } from "@/lib/documents/uploadDocumentDirectToStorage";
import { updateDirectDocumentAction } from "@/actions/documents/updateDirectDocumentAction";
import type { ActionResult } from "@/lib/errors/formatActionErrorResult";
import type { SchoolDocumentRow, SchoolDocumentSlug } from "@/lib/documents/types";

export interface UpdateExistingDocumentParams {
  existingDoc: SchoolDocumentRow;
  slug: SchoolDocumentSlug;
  title: string;
  description: string;
  file: File | null;
}

export async function submitExistingDocumentDirect({
  existingDoc,
  slug,
  title,
  description,
  file,
}: UpdateExistingDocumentParams): Promise<ActionResult> {
  let fileUpdate:
    { filePath: string; fileName: string; fileSize: number; mimeType: string } | undefined;

  if (file) {
    const upload = await uploadDocumentDirectToStorage({ slug, file });
    if (!upload.ok || !upload.filePath) {
      return {
        success: false,
        code: "STORAGE_UPLOAD_ERROR",
        error: upload.error || "File upload failed",
      };
    }
    fileUpdate = {
      filePath: upload.filePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/pdf",
    };
  }

  return updateDirectDocumentAction({
    id: existingDoc.id,
    title: title.trim(),
    description: description.trim() || null,
    fileUpdate,
  });
}
