interface ValidateIncomingFilesInput {
  incoming: File[];
  currentCount: number;
  maxFiles: number;
  maxSizeBytes: number;
  isRtl: boolean;
}

export function validateIncomingFiles({
  incoming,
  currentCount,
  maxFiles,
  maxSizeBytes,
  isRtl,
}: ValidateIncomingFilesInput): {
  valid: File[];
  countError?: string;
  sizeErrors: string[];
} {
  if (currentCount + incoming.length > maxFiles) {
    const countError = isRtl
      ? `الحد الأقصى المسموح به هو ${maxFiles} ملفات`
      : `Maximum allowed is ${maxFiles} files`;
    return { valid: [], countError, sizeErrors: [] };
  }

  const valid: File[] = [];
  const sizeErrors: string[] = [];

  for (const f of incoming) {
    if (f.size > maxSizeBytes) {
      const mb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      sizeErrors.push(
        `${f.name}: ${isRtl ? `الحجم يتجاوز ${mb} ميغابايت` : `File exceeds ${mb} MB`}`,
      );
      continue;
    }
    valid.push(f);
  }

  return { valid, sizeErrors };
}
