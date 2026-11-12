"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { validateIncomingFiles } from "./validateIncomingFiles";
import { MultiFileDropzone } from "./MultiFileDropzone";
import { MultiFileList } from "./MultiFileList";

export interface MultiFileInputProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  id?: string;
  label?: string;
  accept?: string;
  maxFiles?: number;
  maxSizeBytes?: number;
  disabled?: boolean;
}

export function MultiFileInput({
  files,
  onFilesChange,
  id = "multi-file-input",
  label,
  accept = "application/pdf,image/jpeg,image/png,image/webp",
  maxFiles = 10,
  maxSizeBytes = 26214400,
  disabled = false,
}: MultiFileInputProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const incoming = Array.from(e.target.files);
    const { valid, countError, sizeErrors } = validateIncomingFiles({
      incoming,
      currentCount: files.length,
      maxFiles,
      maxSizeBytes,
      isRtl,
    });

    if (countError) toast.error(countError);
    for (const err of sizeErrors) toast.error(err);
    if (valid.length > 0) onFilesChange([...files, ...valid]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClearAll = () => {
    onFilesChange([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {label && <Label htmlFor={id}>{label}</Label>}

      <MultiFileDropzone
        id={id}
        accept={accept}
        disabled={disabled}
        isRtl={isRtl}
        maxSizeBytes={maxSizeBytes}
        onChange={handleFileChange}
        inputRef={inputRef}
      />

      <MultiFileList
        files={files}
        isRtl={isRtl}
        onClearAll={handleClearAll}
        onRemove={(i) => onFilesChange(files.filter((_, idx) => idx !== i))}
      />
    </div>
  );
}
