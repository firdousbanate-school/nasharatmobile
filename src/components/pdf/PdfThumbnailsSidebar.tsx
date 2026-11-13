"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useTranslations } from "next-intl";

interface PdfThumbnailItemProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  isActive: boolean;
  onSelect: (pageNumber: number) => void;
}

function PdfThumbnailItem({ pdfDoc, pageNumber, isActive, onSelect }: PdfThumbnailItemProps) {
  const t = useTranslations("pdfViewer");
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(pageNumber <= 6);

  useEffect(() => {
    const node = buttonRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let task: RenderTask | null = null;

    pdfDoc
      .getPage(pageNumber)
      .then((page) => {
        if (cancelled) return;
        const viewport = page.getViewport({ scale: 0.22 });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        task = page.render({ canvas, viewport });
        return task.promise;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pageNumber, pdfDoc, visible]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => onSelect(pageNumber)}
      aria-label={t("pageLabel", { page: pageNumber })}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-11 w-full flex-col items-center gap-1 rounded-lg border p-1.5 transition ${
        isActive
          ? "border-primary bg-primary/10 ring-1 ring-primary"
          : "border-border bg-background hover:bg-muted"
      }`}
    >
      <canvas ref={canvasRef} className="max-w-full rounded bg-white shadow-xs" />
      <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
        {pageNumber}
      </span>
    </button>
  );
}

interface PdfThumbnailsSidebarProps {
  pdfDoc: PDFDocumentProxy;
  numPages: number;
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
}

export function PdfThumbnailsSidebar({
  pdfDoc,
  numPages,
  currentPage,
  onSelectPage,
}: PdfThumbnailsSidebarProps) {
  const pages = Array.from({ length: numPages }, (_, idx) => idx + 1);

  return (
    <aside className="w-28 shrink-0 overflow-y-auto border-e border-border bg-card/60 p-2 sm:w-32">
      <div className="flex flex-col gap-2">
        {pages.map((pageNumber) => (
          <PdfThumbnailItem
            key={pageNumber}
            pdfDoc={pdfDoc}
            pageNumber={pageNumber}
            isActive={pageNumber === currentPage}
            onSelect={onSelectPage}
          />
        ))}
      </div>
    </aside>
  );
}
