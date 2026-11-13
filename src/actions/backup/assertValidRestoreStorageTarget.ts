import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { ValidationError } from "@/lib/errors/ValidationError";
import type { BackupAccessResult } from "@/lib/backup/assertCanManageBackup";

const ALLOWED_BUCKETS = new Set([
  "public-assets",
  "school-documents",
  "circular-attachments",
  "maintenance-photos",
]);

export function assertValidRestoreStorageTarget(
  access: BackupAccessResult,
  bucket: unknown,
  path: unknown,
): { bucket: string; path: string } {
  if (typeof bucket !== "string" || !ALLOWED_BUCKETS.has(bucket)) {
    throw new ValidationError("Invalid or unpermitted storage bucket");
  }

  if (typeof path !== "string" || !path || path.includes("..")) {
    throw new ValidationError("Invalid storage file path");
  }

  if (access.schoolId && !path.startsWith(`${access.schoolId}/`)) {
    throw new ForbiddenError("Cannot restore storage files outside the assigned school");
  }

  return { bucket, path };
}
