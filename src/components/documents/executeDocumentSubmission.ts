import type { SchoolDocumentRow, SchoolDocumentSlug } from "@/lib/documents/types";
import { submitDocumentDirect } from "./submitDocumentDirect";
import { submitDocumentBatch } from "./submitDocumentBatch";

interface ExecuteDocumentSubmissionInput {
  slug: SchoolDocumentSlug;
  existingDoc?: SchoolDocumentRow | null;
  title: string;
  description: string;
  files: File[];
}

export async function executeDocumentSubmission({
  slug,
  existingDoc,
  title,
  description,
  files,
}: ExecuteDocumentSubmissionInput): Promise<{
  success: boolean;
  failedFile?: string;
  error?: string;
  isUpdate: boolean;
}> {
  if (existingDoc) {
    const res = await submitDocumentDirect({
      slug,
      existingDoc,
      title,
      description,
      file: files[0] || null,
    });
    return { success: res.success, error: res.error, isUpdate: true };
  }

  const batchRes = await submitDocumentBatch({ slug, title, description, files });
  return { ...batchRes, isUpdate: false };
}
