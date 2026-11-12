import type { SchoolDocumentSlug } from "@/lib/documents/types";
import { submitNewDocumentDirect } from "./submitNewDocumentDirect";

interface SubmitDocumentBatchInput {
  slug: SchoolDocumentSlug;
  title: string;
  description: string;
  files: File[];
}

export async function submitDocumentBatch({
  slug,
  title,
  description,
  files,
}: SubmitDocumentBatchInput): Promise<{ success: boolean; failedFile?: string; error?: string }> {
  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i];
    if (!currentFile) continue;

    const docTitle =
      files.length === 1 && title.trim()
        ? title.trim()
        : title.trim()
          ? `${title.trim()} (${i + 1})`
          : currentFile.name.replace(/\.[^/.]+$/, "");

    const result = await submitNewDocumentDirect({
      slug,
      title: docTitle,
      description,
      file: currentFile,
    });

    if (!result.success) {
      return { success: false, failedFile: currentFile.name, error: result.error };
    }
  }

  return { success: true };
}
