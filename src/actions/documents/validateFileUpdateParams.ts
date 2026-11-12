import { ValidationError } from "@/lib/errors/ValidationError";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export function validateFileUpdateParams(
  schoolId: string,
  slug: string,
  fileUpdate: {
    filePath: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  },
): void {
  if (!fileUpdate.filePath?.startsWith(`${schoolId}/${slug}/`)) {
    throw new ValidationError("Invalid storage path for school document");
  }

  if (fileUpdate.fileSize <= 0 || fileUpdate.fileSize > MAX_BYTES) {
    throw new ValidationError("File exceeds the 25MB limit");
  }

  if (!ALLOWED_MIME.includes(fileUpdate.mimeType as (typeof ALLOWED_MIME)[number])) {
    throw new ValidationError("Invalid file format. Allowed: PDF, JPEG, PNG, WebP");
  }
}
