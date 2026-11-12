"use server";

import { assertCanManageDocuments } from "@/lib/documents/assertCanManageDocuments";
import { createSupabaseAdminClient } from "@/lib/supabase/createSupabaseAdminClient";
import { getActorDetails } from "@/lib/documents/getActorDetails";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import type { SchoolDocumentSlug } from "@/lib/documents/types";
import { validateUploadUrlParams } from "./validateUploadUrlParams";

export interface CreateDocumentUploadUrlParams {
  slug: SchoolDocumentSlug;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface DocumentUploadUrlData {
  signedUrl: string;
  token: string;
  path: string;
  schoolId: string;
}

export async function createDocumentUploadUrlAction(
  params: CreateDocumentUploadUrlParams,
): Promise<ActionResult<DocumentUploadUrlData>> {
  try {
    const auth = await assertCanManageDocuments();
    if (!auth.allowed || !auth.schoolId) {
      throw new ForbiddenError("Unauthorized to manage school documents");
    }

    validateUploadUrlParams(params);

    const cleanName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${auth.schoolId}/${params.slug}/${Date.now()}_${cleanName}`;

    const admin = createSupabaseAdminClient(getActorDetails(auth.profile));
    const { data, error } = await admin.storage
      .from("school-documents")
      .createSignedUploadUrl(storagePath, { upsert: true });

    if (error || !data) {
      throw new ValidationError(error?.message || "Failed to generate upload URL");
    }

    return {
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      schoolId: auth.schoolId,
    };
  } catch (error) {
    const sanitized = sanitizeError(error);
    return formatActionErrorResult(sanitized);
  }
}
