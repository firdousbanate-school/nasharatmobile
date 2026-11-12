"use client";

import { UploadCloudIcon } from "lucide-react";

export function MultiFileDropzone({
  id,
  accept,
  disabled,
  isRtl,
  maxSizeBytes,
  onChange,
  inputRef,
}: {
  id: string;
  accept: string;
  disabled: boolean;
  isRtl: boolean;
  maxSizeBytes: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const mb = (maxSizeBytes / (1024 * 1024)).toFixed(0);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/60 p-5 text-center transition-colors hover:border-primary/50">
      <UploadCloudIcon className="mb-2 size-8 text-gold" />
      <label
        htmlFor={id}
        className="cursor-pointer text-xs font-semibold text-primary underline-offset-4 hover:underline sm:text-sm"
      >
        {isRtl
          ? "اضغط لاختيار الملفات (يمكن اختيار عدة ملفات)"
          : "Click to select files (multi-selection)"}
        <input
          ref={inputRef}
          id={id}
          type="file"
          multiple
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={onChange}
        />
      </label>
      <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
        {isRtl
          ? `الحد الأقصى ${mb} ميغابايت للملف (صور، PDF)`
          : `Max ${mb} MB per file (Images, PDF)`}
      </p>
    </div>
  );
}
