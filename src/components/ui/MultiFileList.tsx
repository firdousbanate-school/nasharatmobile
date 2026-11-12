"use client";

import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiFileItem } from "./MultiFileItem";

export function MultiFileList({
  files,
  isRtl,
  onClearAll,
  onRemove,
}: {
  files: File[];
  isRtl: boolean;
  onClearAll: () => void;
  onRemove: (index: number) => void;
}) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {isRtl ? `الملفات المختارة (${files.length})` : `Selected files (${files.length})`}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-8 gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2Icon className="size-3.5" />
          <span>{isRtl ? "حذف الكل" : "Clear All"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {files.map((file, idx) => (
          <MultiFileItem key={`${file.name}-${idx}`} file={file} index={idx} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}
