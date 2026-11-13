"use server";

import { createSupabaseAdminClient } from "@/lib/supabase";
import { assertCanManageBackup } from "@/lib/backup/assertCanManageBackup";
import { listSchoolStorageFiles, type StorageFileEntry } from "@/lib/backup/listSchoolStorageFiles";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";

export type GetSchoolStorageFilesResult = ActionResult & {
  files?: StorageFileEntry[];
};

export async function getSchoolStorageFilesAction(): Promise<GetSchoolStorageFilesResult> {
  try {
    const access = await assertCanManageBackup();
    if (!access.allowed || !access.schoolId) {
      throw new ForbiddenError("Unauthorized to access backup storage");
    }

    const admin = createSupabaseAdminClient();
    const files = await listSchoolStorageFiles(admin, access.schoolId);

    return {
      success: true,
      files,
    };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
