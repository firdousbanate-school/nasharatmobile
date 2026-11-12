"use client";

import { useTranslations } from "next-intl";
import { FileTextIcon, ImageIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MultiFileItem({
  file,
  index,
  onRemove,
}: {
  file: File;
  index: number;
  onRemove: (idx: number) => void;
}) {
  const t = useTranslations("common");
  const isImage = file.type.startsWith("image/");

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-xs shadow-2xs">
      <div className="flex min-w-0 items-center gap-2">
        {isImage ? (
          <ImageIcon className="size-4 shrink-0 text-primary" />
        ) : (
          <FileTextIcon className="size-4 shrink-0 text-primary" />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{file.name}</p>
          <p className="text-[10px] text-muted-foreground" dir="ltr">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(index)}
        className="size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label={t("delete")}
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  );
}
