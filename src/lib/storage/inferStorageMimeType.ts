const EXTENSION_MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/**
 * Infers an appropriate MIME type from the file path extension or declared type.
 * Ensures compatibility with Supabase storage bucket allowed_mime_types.
 */
export function inferStorageMimeType(filePath: string, declaredType?: string | null): string {
  if (declaredType && declaredType !== "application/octet-stream" && declaredType.includes("/")) {
    return declaredType;
  }

  const ext = filePath.split(".").pop()?.toLowerCase();
  if (ext && EXTENSION_MIME_MAP[ext]) {
    return EXTENSION_MIME_MAP[ext];
  }

  return "application/octet-stream";
}
