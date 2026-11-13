"use client";

import {
  Maximize2Icon,
  Minimize2Icon,
  PrinterIcon,
  RotateCwIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { PdfFitMode } from "@/lib/pdf/types";

interface PdfToolbarZoomActionsProps {
  disabled: boolean;
  scale: number;
  fitMode: PdfFitMode;
  isSearchOpen: boolean;
  isFullscreen: boolean;
  isPrinting: boolean;
  compact: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitModeChange: (mode: PdfFitMode) => void;
  onRotate: () => void;
  onToggleSearch: () => void;
  onToggleFullscreen: () => void;
  onPrint: () => void;
}

function PdfZoomButtons({
  disabled,
  scale,
  fitMode,
  onZoomIn,
  onZoomOut,
  onFitModeChange,
}: Pick<
  PdfToolbarZoomActionsProps,
  "disabled" | "scale" | "fitMode" | "onZoomIn" | "onZoomOut" | "onFitModeChange"
>) {
  const t = useTranslations("pdfViewer");
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onZoomOut}
        disabled={disabled}
        aria-label={t("zoomOut")}
        title={t("zoomOut")}
        className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
      >
        <ZoomOutIcon className="size-4" />
      </Button>
      <span className="min-w-10 text-center text-xs font-medium tabular-nums">
        {Math.round(scale * 100)}%
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onZoomIn}
        disabled={disabled}
        aria-label={t("zoomIn")}
        title={t("zoomIn")}
        className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
      >
        <ZoomInIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant={fitMode === "width" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onFitModeChange("width")}
        disabled={disabled}
        className="hidden h-8 px-2 text-xs sm:inline-flex"
      >
        {t("fitWidth")}
      </Button>
      <Button
        type="button"
        variant={fitMode === "page" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onFitModeChange("page")}
        disabled={disabled}
        className="hidden h-8 px-2 text-xs sm:inline-flex"
      >
        {t("fitPage")}
      </Button>
    </>
  );
}

export function PdfToolbarZoomActions(props: PdfToolbarZoomActionsProps) {
  const t = useTranslations("pdfViewer");
  const printLabel = props.isPrinting ? t("preparingPrint") : t("print");
  const fsLabel = props.isFullscreen ? t("exitFullscreen") : t("fullscreen");

  return (
    <div className="flex flex-wrap items-center gap-1">
      <PdfZoomButtons
        disabled={props.disabled}
        scale={props.scale}
        fitMode={props.fitMode}
        onZoomIn={props.onZoomIn}
        onZoomOut={props.onZoomOut}
        onFitModeChange={props.onFitModeChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={props.onRotate}
        disabled={props.disabled}
        aria-label={t("rotate")}
        title={t("rotate")}
        className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
      >
        <RotateCwIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant={props.isSearchOpen ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={props.onToggleSearch}
        disabled={props.disabled}
        aria-label={t("search")}
        aria-pressed={props.isSearchOpen}
        title={t("search")}
        className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
      >
        <SearchIcon className="size-4" />
      </Button>
      {!props.compact && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={props.onPrint}
          disabled={props.disabled || props.isPrinting}
          aria-label={printLabel}
          title={printLabel}
          className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
        >
          <PrinterIcon className="size-4" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={props.onToggleFullscreen}
        aria-label={fsLabel}
        title={fsLabel}
        className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
      >
        {props.isFullscreen ? (
          <Minimize2Icon className="size-4" />
        ) : (
          <Maximize2Icon className="size-4" />
        )}
      </Button>
    </div>
  );
}
