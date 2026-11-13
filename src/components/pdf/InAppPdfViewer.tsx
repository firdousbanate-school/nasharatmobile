"use client";

import { useCallback, useRef, useState } from "react";
import { printPdfDocument } from "@/lib/pdf/printPdfDocument";
import { handlePdfViewerKeyDown } from "./handlePdfViewerKeyDown";
import { PdfSearchBar } from "./PdfSearchBar";
import { PdfThumbnailsSidebar } from "./PdfThumbnailsSidebar";
import { PdfViewerContent } from "./PdfViewerContent";
import { PdfViewerToolbar } from "./PdfViewerToolbar";
import { usePdfFitScale } from "./usePdfFitScale";
import { usePdfFullscreen } from "./usePdfFullscreen";
import { usePdfViewerState } from "./usePdfViewerState";

interface InAppPdfViewerProps {
  url: string;
  title?: string;
  fileName?: string;
  compact?: boolean;
  className?: string;
}

type ViewerState = ReturnType<typeof usePdfViewerState>;

function PdfViewerHeader({
  state,
  compact,
  isFullscreen,
  isPrinting,
  navigateToPage,
  toggleFullscreen,
  handlePrint,
}: {
  state: ViewerState;
  compact: boolean;
  isFullscreen: boolean;
  isPrinting: boolean;
  navigateToPage: (page: number) => void;
  toggleFullscreen: () => void;
  handlePrint: () => void;
}) {
  return (
    <>
      <PdfViewerToolbar
        currentPage={state.currentPage}
        numPages={state.numPages}
        scale={state.scale}
        fitMode={state.fitMode}
        showThumbnails={state.showThumbnails}
        isSearchOpen={state.isSearchOpen}
        isFullscreen={isFullscreen}
        isPrinting={isPrinting}
        compact={compact}
        onPageChange={navigateToPage}
        onZoomIn={state.zoomIn}
        onZoomOut={state.zoomOut}
        onFitModeChange={state.setFitMode}
        onRotate={state.rotateClockwise}
        onToggleThumbnails={() => state.setShowThumbnails((p) => !p)}
        onToggleSearch={() => state.setIsSearchOpen((p) => !p)}
        onToggleFullscreen={toggleFullscreen}
        onPrint={handlePrint}
      />
      {state.isSearchOpen && (
        <PdfSearchBar
          query={state.searchQuery}
          onQueryChange={state.setSearchQuery}
          matchCount={state.searchMatches.length}
          activeMatchIndex={state.activeMatchIndex}
          isSearching={state.isSearching}
          onPrevMatch={() => state.stepMatch(-1)}
          onNextMatch={() => state.stepMatch(1)}
          onClose={() => {
            state.setIsSearchOpen(false);
            state.setSearchQuery("");
          }}
        />
      )}
    </>
  );
}

function PdfViewerBody({
  state,
  compact,
  scrollRoot,
  setScrollRoot,
  navigateToPage,
  registerPageRef,
}: {
  state: ViewerState;
  compact: boolean;
  scrollRoot: HTMLDivElement | null;
  setScrollRoot: (node: HTMLDivElement | null) => void;
  navigateToPage: (page: number) => void;
  registerPageRef: (pageNumber: number, node: HTMLDivElement | null) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {state.showThumbnails && state.pdfDoc && !compact && (
        <PdfThumbnailsSidebar
          pdfDoc={state.pdfDoc}
          numPages={state.numPages}
          currentPage={state.currentPage}
          onSelectPage={navigateToPage}
        />
      )}
      <PdfViewerContent
        isLoading={state.isLoading}
        loadProgress={state.loadProgress}
        errorKind={state.errorKind}
        pdfDoc={state.pdfDoc}
        numPages={state.numPages}
        scale={state.scale}
        rotation={state.rotation}
        searchQuery={state.searchQuery}
        activeMatch={state.searchMatches[state.activeMatchIndex]}
        scrollRoot={scrollRoot}
        setScrollRoot={setScrollRoot}
        onBecomeVisible={state.setCurrentPage}
        registerPageRef={registerPageRef}
        onRetry={state.retry}
      />
    </div>
  );
}

export function InAppPdfViewer({
  url,
  title,
  fileName,
  compact = false,
  className = "",
}: InAppPdfViewerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [isPrinting, setIsPrinting] = useState(false);

  const state = usePdfViewerState(url);
  const { isFullscreen, toggleFullscreen } = usePdfFullscreen(rootRef);
  usePdfFitScale(state.pdfDoc, scrollRoot, state.fitMode, state.rotation, state.setScale);

  const registerPageRef = useCallback((pageNumber: number, node: HTMLDivElement | null) => {
    if (node) pageRefs.current.set(pageNumber, node);
    else pageRefs.current.delete(pageNumber);
  }, []);

  const navigateToPage = useCallback(
    (pageNumber: number) => {
      state.goToPage(pageNumber);
      pageRefs.current.get(pageNumber)?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [state],
  );

  const handlePrint = useCallback(async () => {
    if (!state.pdfDoc || isPrinting) return;
    setIsPrinting(true);
    try {
      await printPdfDocument(state.pdfDoc, fileName ?? title);
    } finally {
      setIsPrinting(false);
    }
  }, [fileName, isPrinting, state.pdfDoc, title]);

  const fsClass = isFullscreen
    ? "fixed inset-0 z-50 h-dvh w-screen rounded-none bg-background"
    : "";

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      aria-label={title ?? fileName ?? "PDF"}
      className={`flex flex-col overflow-hidden rounded-lg border border-border bg-muted/40 outline-none ${fsClass} ${className}`}
      onKeyDown={(e) =>
        handlePdfViewerKeyDown(e, {
          currentPage: state.currentPage,
          isSearchOpen: state.isSearchOpen,
          onOpenSearch: () => state.setIsSearchOpen(true),
          onCloseSearch: () => state.setIsSearchOpen(false),
          onNavigatePage: navigateToPage,
          onZoomIn: state.zoomIn,
          onZoomOut: state.zoomOut,
        })
      }
    >
      <PdfViewerHeader
        state={state}
        compact={compact}
        isFullscreen={isFullscreen}
        isPrinting={isPrinting}
        navigateToPage={navigateToPage}
        toggleFullscreen={toggleFullscreen}
        handlePrint={handlePrint}
      />
      <PdfViewerBody
        state={state}
        compact={compact}
        scrollRoot={scrollRoot}
        setScrollRoot={setScrollRoot}
        navigateToPage={navigateToPage}
        registerPageRef={registerPageRef}
      />
    </div>
  );
}
