"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useTranslations } from "next-intl";
import type { PdfRotation } from "@/lib/pdf/types";
import { highlightTextLayer } from "./highlightTextLayer";
import { renderPdfPageLayer } from "./renderPdfPageLayer";

interface PdfPageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  rotation: PdfRotation;
  searchQuery: string;
  activePageMatchIndex: number | null;
  scrollRoot: HTMLDivElement | null;
  onBecomeVisible?: (pageNumber: number) => void;
  registerPageRef?: (pageNumber: number, node: HTMLDivElement | null) => void;
}

export function PdfPageCanvas(props: PdfPageCanvasProps) {
  const { pdfDoc, pageNumber, scale, rotation, searchQuery, activePageMatchIndex } = props;
  const { scrollRoot, onBecomeVisible, registerPageRef } = props;
  const t = useTranslations("pdfViewer");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(pageNumber <= 2);
  const [dimensions, setDimensions] = useState({ width: 612, height: 792 });

  useEffect(() => {
    registerPageRef?.(pageNumber, containerRef.current);
    return () => registerPageRef?.(pageNumber, null);
  }, [pageNumber, registerPageRef]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setIsNearViewport(true);
          if (entry.intersectionRatio >= 0.45) onBecomeVisible?.(pageNumber);
        }
      },
      { root: scrollRoot, rootMargin: "350px 0px", threshold: [0.01, 0.45] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onBecomeVisible, pageNumber, scrollRoot]);

  useEffect(() => {
    if (!isNearViewport || !canvasRef.current || !textLayerRef.current) return;
    let cancelled = false;
    let cancelRender: (() => void) | null = null;

    void renderPdfPageLayer({
      pdfDoc,
      pageNumber,
      scale,
      rotation,
      canvas: canvasRef.current,
      textContainer: textLayerRef.current,
      searchQuery,
      activePageMatchIndex,
      onResize: setDimensions,
      isCancelled: () => cancelled,
      onRegisterCancel: (fn) => {
        cancelRender = fn;
      },
    }).catch(() => {});

    return () => {
      cancelled = true;
      cancelRender?.();
    };
  }, [activePageMatchIndex, isNearViewport, pageNumber, pdfDoc, rotation, scale, searchQuery]);

  useEffect(() => {
    if (textLayerRef.current) {
      highlightTextLayer(textLayerRef.current, searchQuery, activePageMatchIndex);
    }
  }, [searchQuery, activePageMatchIndex]);

  return (
    <div
      ref={containerRef}
      data-pdf-page={pageNumber}
      aria-label={t("pageLabel", { page: pageNumber })}
      style={{ width: dimensions.width, height: dimensions.height }}
      className="relative mx-auto shrink-0 overflow-hidden rounded-md bg-white shadow-md ring-1 ring-border"
    >
      <canvas ref={canvasRef} className="block" />
      <div ref={textLayerRef} className="textLayer" />
    </div>
  );
}
