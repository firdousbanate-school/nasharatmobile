import { ValidationError } from "@/lib/errors/ValidationError";
import type { BackupAccessResult } from "@/lib/backup/assertCanManageBackup";
import { assertValidRestoreStorageTarget } from "./assertValidRestoreStorageTarget";

export type ValidatedStorageInput = {
  bucket: string;
  path: string;
  file: File;
};

export function validateRestoreStorageInput(
  access: BackupAccessResult,
  formData: FormData,
): ValidatedStorageInput {
  const { bucket, path } = assertValidRestoreStorageTarget(
    access,
    formData.get("bucket"),
    formData.get("path"),
  );

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new ValidationError("Missing or invalid file binary");
  }

  return { bucket, path, file };
}
