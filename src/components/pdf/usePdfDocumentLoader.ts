"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { classifyPdfError } from "@/lib/pdf/classifyPdfError";
import { fetchPdfDocument } from "@/lib/pdf/fetchPdfDocument";
import type { PdfLoadErrorKind } from "@/lib/pdf/types";

export function usePdfDocumentLoader(url: string) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [errorKind, setErrorKind] = useState<PdfLoadErrorKind | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const activeDocRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    let localTask: { destroy: () => Promise<void> } | null = null;

    async function load() {
      await Promise.resolve();
      if (!mounted || controller.signal.aborted) return;
      setIsLoading(true);
      setLoadProgress(0);
      setErrorKind(null);
      setPdfDoc(null);
      setNumPages(0);

      try {
        const { document, loadingTask } = await fetchPdfDocument({
          url,
          signal: controller.signal,
          onProgress: (percent) => {
            if (mounted) setLoadProgress(percent);
          },
        });
        localTask = loadingTask;
        if (!mounted || controller.signal.aborted) {
          void document.cleanup();
          void loadingTask.destroy();
          return;
        }
        activeDocRef.current = document;
        setPdfDoc(document);
        setNumPages(document.numPages);
        setIsLoading(false);
      } catch (err: unknown) {
        if (!mounted || controller.signal.aborted) return;
        setErrorKind(classifyPdfError(err));
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
      controller.abort();
      const docToCleanup = activeDocRef.current;
      activeDocRef.current = null;
      if (docToCleanup) void docToCleanup.cleanup();
      if (localTask) void localTask.destroy();
    };
  }, [url, reloadToken]);

  const retry = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  return { pdfDoc, numPages, isLoading, loadProgress, errorKind, retry };
}
