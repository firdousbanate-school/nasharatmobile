import { ValidationError } from "@/lib/errors/ValidationError";
import type { SchoolDocumentSlug } from "@/lib/documents/types";

const VALID_SLUGS: readonly SchoolDocumentSlug[] = [
  "operational-plan",
  "committees-guide",
  "counseling-guide",
];

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export function validateUploadUrlParams(params: {
  slug: SchoolDocumentSlug;
  fileName: string;
  fileSize: number;
  mimeType: string;
}): void {
  if (!VALID_SLUGS.includes(params.slug)) {
    throw new ValidationError("Invalid document category");
  }
  if (!params.fileName?.trim()) {
    throw new ValidationError("File name is required");
  }
  if (params.fileSize <= 0 || params.fileSize > MAX_BYTES) {
    throw new ValidationError("File exceeds the 25MB limit");
  }
  if (!ALLOWED_MIME.includes(params.mimeType as (typeof ALLOWED_MIME)[number])) {
    throw new ValidationError("Invalid file format. Allowed: PDF, JPEG, PNG, WebP");
  }
}
