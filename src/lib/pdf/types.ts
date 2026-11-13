import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

export type PdfFitMode = "width" | "page" | "custom";

export type PdfRotation = 0 | 90 | 180 | 270;

export type PdfLoadErrorKind = "unauthorized" | "forbidden" | "notFound" | "corrupted" | "network";

export interface PdfSearchMatch {
  pageNumber: number;
  matchIndex: number;
}

export interface PdfLoadedHandle {
  document: PDFDocumentProxy;
  loadingTask: PDFDocumentLoadingTask;
}
