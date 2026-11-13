"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PanelLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PdfToolbarPageNavProps {
  currentPage: number;
  numPages: number;
  showThumbnails: boolean;
  compact: boolean;
  onPageChange: (page: number) => void;
  onToggleThumbnails: () => void;
}

function PdfPageInput({
  currentPage,
  numPages,
  onPageChange,
}: {
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("pdfViewer");
  const [draftPage, setDraftPage] = useState<string | null>(null);
  const commit = () => {
    if (draftPage === null) return;
    const parsed = Number.parseInt(draftPage, 10);
    setDraftPage(null);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= numPages) onPageChange(parsed);
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      <Input
        type="number"
        inputMode="numeric"
        min={1}
        max={Math.max(1, numPages)}
        value={draftPage ?? String(currentPage)}
        onChange={(e) => setDraftPage(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        aria-label={t("pageInputLabel")}
        disabled={numPages === 0}
        className="h-9 w-12 px-1.5 text-center text-base tabular-nums md:h-7 md:w-12 md:text-xs"
      />
      <span className="whitespace-nowrap text-muted-foreground tabular-nums">
        {t("pageOfTotal", { total: numPages })}
      </span>
    </div>
  );
}

export function PdfToolbarPageNav({
  currentPage,
  numPages,
  showThumbnails,
  compact,
  onPageChange,
  onToggleThumbnails,
}: PdfToolbarPageNavProps) {
  const t = useTranslations("pdfViewer");
  return (
    <div className="flex items-center gap-1">
      {!compact && (
        <Button
          type="button"
          variant={showThumbnails ? "secondary" : "ghost"}
          size="icon-sm"
          onClick={onToggleThumbnails}
          aria-label={t("thumbnails")}
          aria-pressed={showThumbnails}
          title={t("thumbnails")}
          className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
        >
          <PanelLeftIcon className="size-4 rtl:rotate-180" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || numPages === 0}
        aria-label={t("previousPage")}
        title={t("previousPage")}
        className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
      >
        <ChevronLeftIcon className="size-4 rtl:rotate-180" />
      </Button>
      <PdfPageInput currentPage={currentPage} numPages={numPages} onPageChange={onPageChange} />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= numPages || numPages === 0}
        aria-label={t("nextPage")}
        title={t("nextPage")}
        className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
      >
        <ChevronRightIcon className="size-4 rtl:rotate-180" />
      </Button>
    </div>
  );
}
