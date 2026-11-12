"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/createSupabaseAdminClient";
import { assertCanManageDocuments } from "@/lib/documents/assertCanManageDocuments";
import { getActorDetails } from "@/lib/documents/getActorDetails";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import type { SchoolDocumentSlug } from "@/lib/documents/types";
import { validateDirectDocumentParams } from "./validateDirectDocumentParams";
import { insertDirectDocumentRow } from "./insertDirectDocumentRow";

export interface SaveDirectDocumentParams {
  slug: SchoolDocumentSlug;
  title: string;
  description?: string | null;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export async function saveDirectDocumentAction(
  params: SaveDirectDocumentParams,
): Promise<ActionResult<{ documentId: string }>> {
  try {
    const auth = await assertCanManageDocuments();
    if (!auth.allowed || !auth.schoolId) {
      throw new ForbiddenError("Unauthorized to manage school documents");
    }

    const title = validateDirectDocumentParams(auth.schoolId, params);
    const admin = createSupabaseAdminClient(getActorDetails(auth.profile));

    const documentId = await insertDirectDocumentRow({
      admin,
      schoolId: auth.schoolId,
      slug: params.slug,
      title,
      description: params.description,
      filePath: params.filePath,
      fileName: params.fileName,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      profileId: auth.profile?.id,
    });

    revalidatePath(`/[locale]/documents/${params.slug}`, "page");
    revalidatePath(`/ar/documents/${params.slug}`, "page");
    revalidatePath(`/en/documents/${params.slug}`, "page");
    revalidatePath("/[locale]", "page");
    revalidatePath("/ar", "page");
    revalidatePath("/en", "page");
    revalidatePath("/", "page");

    return { success: true, documentId };
  } catch (error) {
    const sanitized = sanitizeError(error);
    return formatActionErrorResult(sanitized);
  }
}
