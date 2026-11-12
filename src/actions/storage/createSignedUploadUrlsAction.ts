"use server";

import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { createSupabaseAdminClient } from "@/lib/supabase/createSupabaseAdminClient";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import { generateSingleSignedUploadUrl } from "./generateSingleSignedUploadUrl";

export interface FileMetadataInput {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface CreateSignedUploadUrlsParams {
  bucket:
    | "circular-attachments"
    | "maintenance-photos"
    | "achievement-attachments"
    | "school-documents"
    | "public-assets";
  folder?: string;
  files: FileMetadataInput[];
}

export interface SignedUploadUrlItem {
  fileName: string;
  storagePath: string;
  signedUrl: string;
  token: string;
}

export async function createSignedUploadUrlsAction(
  params: CreateSignedUploadUrlsParams,
): Promise<ActionResult<{ items: SignedUploadUrlItem[] }>> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.is_active || !profile.school_id) {
      throw new AuthenticationError("Active school session is required");
    }

    if (!params.files || params.files.length === 0) {
      throw new ValidationError("No files provided for upload");
    }

    const schoolId = profile.school_id;
    const admin = createSupabaseAdminClient({
      actorId: profile.id,
      actorLabel: profile.full_name,
    });

    const results: SignedUploadUrlItem[] = [];
    for (const file of params.files) {
      const item = await generateSingleSignedUploadUrl(
        admin,
        params.bucket,
        schoolId,
        params.folder,
        file,
      );
      results.push(item);
    }

    return { success: true, items: results };
  } catch (error) {
    const sanitized = sanitizeError(error);
    return formatActionErrorResult(sanitized);
  }
}
