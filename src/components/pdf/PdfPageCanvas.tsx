"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useTranslations } from "next-intl";
import type { PdfRotation } from "@/lib/pdf/types";
import { highlightTextLayer } from "./highlightTextLayer";
import { renderPdfPageLayer } from "./renderPdfPageLayer";
import { usePageVisibilityObservers } from "./usePageVisibilityObservers";

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
  const renderQueueRef = useRef<Promise<void>>(Promise.resolve());
  const searchRef = useRef({ searchQuery, activePageMatchIndex });
  const [dimensions, setDimensions] = useState({ width: 612, height: 792 });

  const isNearViewport = usePageVisibilityObservers(
    containerRef,
    scrollRoot,
    pageNumber,
    onBecomeVisible,
  );

  useEffect(() => {
    searchRef.current = { searchQuery, activePageMatchIndex };
  }, [searchQuery, activePageMatchIndex]);

  useEffect(() => {
    registerPageRef?.(pageNumber, containerRef.current);
    return () => registerPageRef?.(pageNumber, null);
  }, [pageNumber, registerPageRef]);

  useEffect(() => {
    if (!isNearViewport || !canvasRef.current || !textLayerRef.current) return;
    let cancelled = false;
    let cancelRender: (() => void) | null = null;
    const canvas = canvasRef.current;
    const textContainer = textLayerRef.current;

    renderQueueRef.current = renderQueueRef.current.then(async () => {
      if (cancelled) return;
      await renderPdfPageLayer({
        pdfDoc,
        pageNumber,
        scale,
        rotation,
        canvas,
        textContainer,
        searchQuery: searchRef.current.searchQuery,
        activePageMatchIndex: searchRef.current.activePageMatchIndex,
        onResize: setDimensions,
        isCancelled: () => cancelled,
        onRegisterCancel: (fn) => {
          cancelRender = fn;
        },
      }).catch(() => {});
    });

    return () => {
      cancelled = true;
      cancelRender?.();
    };
  }, [isNearViewport, pageNumber, pdfDoc, rotation, scale]);

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
