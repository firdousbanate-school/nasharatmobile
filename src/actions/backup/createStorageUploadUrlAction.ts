"use server";

import { createSupabaseAdminClient } from "@/lib/supabase";
import { assertCanManageBackup } from "@/lib/backup/assertCanManageBackup";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import { assertValidRestoreStorageTarget } from "./assertValidRestoreStorageTarget";

export type CreateStorageUploadUrlResult = ActionResult<{
  signedUrl?: string;
  token?: string;
  path?: string;
}>;

export async function createStorageUploadUrlAction(input: {
  bucket: string;
  path: string;
}): Promise<CreateStorageUploadUrlResult> {
  try {
    const access = await assertCanManageBackup();
    if (!access.allowed) {
      throw new ForbiddenError("Unauthorized to restore storage files");
    }

    const { bucket, path } = assertValidRestoreStorageTarget(access, input.bucket, input.path);
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path, {
      upsert: true,
    });

    if (error || !data) {
      throw new Error(`Failed to create signed upload URL for ${path}: ${error?.message}`);
    }

    return {
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
    };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
