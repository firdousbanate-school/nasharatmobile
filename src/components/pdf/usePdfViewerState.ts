"use client";

import { useCallback, useState } from "react";
import type { PdfFitMode, PdfRotation } from "@/lib/pdf/types";
import { usePdfDocumentLoader } from "./usePdfDocumentLoader";
import { usePdfSearch } from "./usePdfSearch";

const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;
const SCALE_STEP = 0.25;

export function usePdfViewerState(url: string) {
  const loader = usePdfDocumentLoader(url);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [fitMode, setFitMode] = useState<PdfFitMode>("width");
  const [rotation, setRotation] = useState<PdfRotation>(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const goToPage = useCallback(
    (page: number) => {
      if (loader.numPages <= 0) return;
      setCurrentPage(Math.max(1, Math.min(loader.numPages, Math.trunc(page))));
    },
    [loader.numPages],
  );

  const search = usePdfSearch(loader.pdfDoc, goToPage);

  const zoomIn = useCallback(() => {
    setFitMode("custom");
    setScale((prev) => Math.min(MAX_SCALE, Number((prev + SCALE_STEP).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setFitMode("custom");
    setScale((prev) => Math.max(MIN_SCALE, Number((prev - SCALE_STEP).toFixed(2))));
  }, []);

  const rotateClockwise = useCallback(() => {
    setRotation((prev) => ((prev + 90) % 360) as PdfRotation);
  }, []);

  return {
    ...loader,
    ...search,
    currentPage,
    setCurrentPage,
    scale,
    setScale,
    fitMode,
    setFitMode,
    rotation,
    showThumbnails,
    setShowThumbnails,
    isSearchOpen,
    setIsSearchOpen,
    goToPage,
    zoomIn,
    zoomOut,
    rotateClockwise,
  };
}
