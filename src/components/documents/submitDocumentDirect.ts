import type { ActionResult } from "@/lib/errors/formatActionErrorResult";
import type { SchoolDocumentRow, SchoolDocumentSlug } from "@/lib/documents/types";
import { submitExistingDocumentDirect } from "./submitExistingDocumentDirect";
import { submitNewDocumentDirect } from "./submitNewDocumentDirect";

export interface SubmitDocumentDirectParams {
  slug: SchoolDocumentSlug;
  existingDoc?: SchoolDocumentRow | null;
  title: string;
  description: string;
  file: File | null;
}

export async function submitDocumentDirect({
  slug,
  existingDoc,
  title,
  description,
  file,
}: SubmitDocumentDirectParams): Promise<ActionResult> {
  try {
    if (existingDoc) {
      return await submitExistingDocumentDirect({
        existingDoc,
        slug,
        title,
        description,
        file,
      });
    }

    return await submitNewDocumentDirect({
      slug,
      title,
      description,
      file,
    });
  } catch (err) {
    return {
      success: false,
      code: "UNKNOWN_ERROR",
      error: err instanceof Error ? err.message : "Unexpected error during document submission",
    };
  }
}
