import { createSchoolDocumentAction } from "@/actions/documents/createSchoolDocumentAction";
import { updateSchoolDocumentAction } from "@/actions/documents/updateSchoolDocumentAction";
import type { ActionResult } from "@/lib/errors/formatActionErrorResult";
import type { SchoolDocumentRow, SchoolDocumentSlug } from "@/lib/documents/types";

export async function submitDocumentFormData({
  slug,
  existingDoc,
  title,
  description,
  file,
}: {
  slug: SchoolDocumentSlug;
  existingDoc?: SchoolDocumentRow | null;
  title: string;
  description: string;
  file: File | null;
}): Promise<ActionResult> {
  const formData = new FormData();
  formData.append("title", title.trim());
  formData.append("description", description.trim());
  if (file) {
    formData.append("file", file);
  }

  try {
    if (existingDoc) {
      formData.append("id", existingDoc.id);
      return await updateSchoolDocumentAction(formData);
    }
    formData.append("slug", slug);
    return await createSchoolDocumentAction(formData);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : undefined,
    };
  }
}
