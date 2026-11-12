"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/createSupabaseAdminClient";
import { assertCanManageDocuments } from "@/lib/documents/assertCanManageDocuments";
import { findDocumentForSchool } from "@/lib/documents/findDocumentForSchool";
import { getActorDetails } from "@/lib/documents/getActorDetails";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import { buildUpdateDocumentPayload } from "./buildUpdateDocumentPayload";

export interface UpdateDirectDocumentParams {
  id: string;
  title: string;
  description?: string | null;
  fileUpdate?: {
    filePath: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
}

export async function updateDirectDocumentAction(
  params: UpdateDirectDocumentParams,
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const auth = await assertCanManageDocuments();
    if (!auth.allowed || !auth.schoolId) {
      throw new ForbiddenError("Unauthorized to manage school documents");
    }

    if (!params.id) {
      throw new ValidationError("Document ID is required");
    }

    const title = params.title?.trim();
    if (!title) {
      throw new ValidationError("Document title is required");
    }

    const admin = createSupabaseAdminClient(getActorDetails(auth.profile));
    const existing = await findDocumentForSchool(admin, params.id, auth.schoolId);

    const updatePayload = await buildUpdateDocumentPayload({
      admin,
      schoolId: auth.schoolId,
      slug: existing.slug,
      title,
      description: params.description,
      existingFilePath: existing.file_path,
      fileUpdate: params.fileUpdate,
    });

    const { error: updateError } = await admin
      .from("school_documents")
      .update(updatePayload)
      .eq("id", params.id)
      .eq("school_id", auth.schoolId);

    if (updateError) {
      throw new ValidationError(updateError.message || "Failed to update document");
    }

    revalidatePath(`/[locale]/documents/${existing.slug}`, "page");
    revalidatePath(`/ar/documents/${existing.slug}`, "page");
    revalidatePath(`/en/documents/${existing.slug}`, "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/ar", "page");
    revalidatePath("/en", "page");
    revalidatePath("/", "page");

    return { success: true };
  } catch (error) {
    const sanitized = sanitizeError(error);
    return formatActionErrorResult(sanitized);
  }
}
