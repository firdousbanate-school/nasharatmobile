"use client";

import { useCallback, useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { searchPdfDocument } from "@/lib/pdf/searchPdfDocument";
import type { PdfSearchMatch } from "@/lib/pdf/types";

export function usePdfSearch(
  pdfDoc: PDFDocumentProxy | null,
  onNavigateToPage: (page: number) => void,
) {
  const [searchQuery, setSearchQueryState] = useState("");
  const [searchMatches, setSearchMatches] = useState<PdfSearchMatch[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!pdfDoc || !trimmed) return;

    const controller = new AbortController();

    async function runSearch() {
      await Promise.resolve();
      if (controller.signal.aborted || !pdfDoc) return;
      setIsSearching(true);

      try {
        const matches = await searchPdfDocument(pdfDoc, trimmed, controller.signal);
        if (controller.signal.aborted) return;
        setSearchMatches(matches);
        setActiveMatchIndex(0);
        setIsSearching(false);
        if (matches.length > 0) onNavigateToPage(matches[0].pageNumber);
      } catch {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }

    void runSearch();
    return () => controller.abort();
  }, [onNavigateToPage, pdfDoc, searchQuery]);

  const setSearchQuery = useCallback((nextQuery: string) => {
    setSearchQueryState(nextQuery);
    if (!nextQuery.trim()) {
      setSearchMatches([]);
      setActiveMatchIndex(0);
      setIsSearching(false);
    }
  }, []);

  const stepMatch = useCallback(
    (delta: 1 | -1) => {
      if (searchMatches.length === 0) return;
      const next = (activeMatchIndex + delta + searchMatches.length) % searchMatches.length;
      setActiveMatchIndex(next);
      onNavigateToPage(searchMatches[next].pageNumber);
    },
    [activeMatchIndex, onNavigateToPage, searchMatches],
  );

  return { searchQuery, setSearchQuery, searchMatches, activeMatchIndex, isSearching, stepMatch };
}
