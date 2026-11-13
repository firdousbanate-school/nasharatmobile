"use client";

import { useTranslations } from "next-intl";
import type { PdfFitMode } from "@/lib/pdf/types";
import { PdfToolbarPageNav } from "./PdfToolbarPageNav";
import { PdfToolbarZoomActions } from "./PdfToolbarZoomActions";

interface PdfViewerToolbarProps {
  currentPage: number;
  numPages: number;
  scale: number;
  fitMode: PdfFitMode;
  showThumbnails: boolean;
  isSearchOpen: boolean;
  isFullscreen: boolean;
  isPrinting: boolean;
  compact?: boolean;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitModeChange: (mode: PdfFitMode) => void;
  onRotate: () => void;
  onToggleThumbnails: () => void;
  onToggleSearch: () => void;
  onToggleFullscreen: () => void;
  onPrint: () => void;
}

export function PdfViewerToolbar(props: PdfViewerToolbarProps) {
  const t = useTranslations("pdfViewer");
  const compact = props.compact ?? false;

  return (
    <div
      role="toolbar"
      aria-label={t("toolbarLabel")}
      className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border bg-card px-2 py-1.5 text-card-foreground"
    >
      <PdfToolbarPageNav
        currentPage={props.currentPage}
        numPages={props.numPages}
        showThumbnails={props.showThumbnails}
        compact={compact}
        onPageChange={props.onPageChange}
        onToggleThumbnails={props.onToggleThumbnails}
      />
      <PdfToolbarZoomActions
        disabled={props.numPages === 0}
        scale={props.scale}
        fitMode={props.fitMode}
        isSearchOpen={props.isSearchOpen}
        isFullscreen={props.isFullscreen}
        isPrinting={props.isPrinting}
        compact={compact}
        onZoomIn={props.onZoomIn}
        onZoomOut={props.onZoomOut}
        onFitModeChange={props.onFitModeChange}
        onRotate={props.onRotate}
        onToggleSearch={props.onToggleSearch}
        onToggleFullscreen={props.onToggleFullscreen}
        onPrint={props.onPrint}
      />
    </div>
  );
}
