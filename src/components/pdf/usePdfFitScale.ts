"use client";

import { useEffect } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfFitMode, PdfRotation } from "@/lib/pdf/types";

export function usePdfFitScale(
  pdfDoc: PDFDocumentProxy | null,
  scrollRoot: HTMLDivElement | null,
  fitMode: PdfFitMode,
  rotation: PdfRotation,
  setScale: (scale: number) => void,
) {
  useEffect(() => {
    if (!pdfDoc || !scrollRoot || fitMode === "custom") return;
    let cancelled = false;

    const updateFitScale = async () => {
      const page = await pdfDoc.getPage(1);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1, rotation });
      const width = Math.max(240, scrollRoot.clientWidth - 24);
      const height = Math.max(240, scrollRoot.clientHeight - 24);
      const raw =
        fitMode === "width"
          ? width / base.width
          : Math.min(width / base.width, height / base.height);
      setScale(Math.max(0.4, Math.min(3.0, Number(raw.toFixed(2)))));
    };

    void updateFitScale();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      void updateFitScale();
    });
    observer.observe(scrollRoot);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [fitMode, pdfDoc, rotation, scrollRoot, setScale]);
}
