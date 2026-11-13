import { loadPdfjs } from "./loadPdfjs";
import { readStreamWithProgress } from "./readStreamWithProgress";
import type { PdfLoadedHandle } from "./types";

interface FetchPdfOptions {
  url: string;
  signal: AbortSignal;
  onProgress?: (percent: number) => void;
}

/**
 * Fetches a protected or signed PDF URL and initializes a PDF.js document handle.
 */
export async function fetchPdfDocument({
  url,
  signal,
  onProgress,
}: FetchPdfOptions): Promise<PdfLoadedHandle> {
  const response = await fetch(url, {
    credentials: "same-origin",
    signal,
  });

  if (!response.ok) {
    const error = new Error(`Failed to fetch PDF (HTTP ${response.status})`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  const data = await readStreamWithProgress(response, onProgress);
  if (signal.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  if (data.byteLength === 0) {
    const emptyError = new Error("Invalid PDF: empty payload");
    emptyError.name = "InvalidPDFException";
    throw emptyError;
  }

  const pdfjs = await loadPdfjs();
  const loadingTask = pdfjs.getDocument({
    data,
    cMapUrl: "/pdfjs/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/pdfjs/standard_fonts/",
    wasmUrl: "/pdfjs/wasm/",
  });

  if (signal.aborted) {
    await loadingTask.destroy();
    throw new DOMException("Aborted", "AbortError");
  }

  const document = await loadingTask.promise;
  return { document, loadingTask };
}
