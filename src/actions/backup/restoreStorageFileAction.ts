"use server";

import { createSupabaseAdminClient } from "@/lib/supabase";
import { assertCanManageBackup } from "@/lib/backup/assertCanManageBackup";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import { inferStorageMimeType } from "@/lib/storage/inferStorageMimeType";
import { validateRestoreStorageInput } from "./validateRestoreStorageInput";

export async function restoreStorageFileAction(formData: FormData): Promise<ActionResult> {
  try {
    const access = await assertCanManageBackup();
    if (!access.allowed) {
      throw new ForbiddenError("Unauthorized to restore storage files");
    }

    const { bucket, path, file } = validateRestoreStorageInput(access, formData);
    const admin = createSupabaseAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = inferStorageMimeType(path, file.type);

    const { error } = await admin.storage.from(bucket).upload(path, buffer, {
      upsert: true,
      contentType,
    });

    if (error) {
      throw new Error(`Failed to restore storage file ${path}: ${error.message}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
