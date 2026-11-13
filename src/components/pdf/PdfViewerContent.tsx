"use client";

import { Loader2Icon } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useTranslations } from "next-intl";
import type { PdfLoadErrorKind, PdfRotation, PdfSearchMatch } from "@/lib/pdf/types";
import { PdfErrorState } from "./PdfErrorState";
import { PdfPageCanvas } from "./PdfPageCanvas";

interface PdfViewerContentProps {
  isLoading: boolean;
  loadProgress: number;
  errorKind: PdfLoadErrorKind | null;
  pdfDoc: PDFDocumentProxy | null;
  numPages: number;
  scale: number;
  rotation: PdfRotation;
  searchQuery: string;
  activeMatch?: PdfSearchMatch;
  scrollRoot: HTMLDivElement | null;
  setScrollRoot: (node: HTMLDivElement | null) => void;
  onBecomeVisible: (page: number) => void;
  registerPageRef: (pageNumber: number, node: HTMLDivElement | null) => void;
  onRetry: () => void;
}

export function PdfViewerContent({
  isLoading,
  loadProgress,
  errorKind,
  pdfDoc,
  numPages,
  scale,
  rotation,
  searchQuery,
  activeMatch,
  scrollRoot,
  setScrollRoot,
  onBecomeVisible,
  registerPageRef,
  onRetry,
}: PdfViewerContentProps) {
  const t = useTranslations("pdfViewer");
  const pages = Array.from({ length: numPages }, (_, idx) => idx + 1);

  return (
    <div ref={setScrollRoot} className="flex-1 overflow-auto p-3">
      {isLoading && (
        <div className="flex h-full min-h-56 flex-col items-center justify-center gap-3">
          <Loader2Icon className="size-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {loadProgress > 0 ? t("loadingProgress", { percent: loadProgress }) : t("loading")}
          </p>
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${Math.max(8, loadProgress)}%` }}
            />
          </div>
        </div>
      )}

      {!isLoading && errorKind && <PdfErrorState errorKind={errorKind} onRetry={onRetry} />}

      {!isLoading && !errorKind && pdfDoc && (
        <div className="flex flex-col items-center gap-4">
          {pages.map((pageNumber) => (
            <PdfPageCanvas
              key={pageNumber}
              pdfDoc={pdfDoc}
              pageNumber={pageNumber}
              scale={scale}
              rotation={rotation}
              searchQuery={searchQuery}
              activePageMatchIndex={
                activeMatch?.pageNumber === pageNumber ? activeMatch.matchIndex : null
              }
              scrollRoot={scrollRoot}
              onBecomeVisible={onBecomeVisible}
              registerPageRef={registerPageRef}
            />
          ))}
        </div>
      )}
    </div>
  );
}
