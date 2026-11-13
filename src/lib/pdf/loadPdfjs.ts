type PdfjsModule = typeof import("pdfjs-dist");

let cachedPdfjsPromise: Promise<PdfjsModule> | null = null;

/**
 * Dynamically loads pdfjs-dist in the browser and configures the local same-origin worker.
 */
export async function loadPdfjs(): Promise<PdfjsModule> {
  if (typeof window === "undefined") {
    throw new Error("PDF.js can only be loaded in a browser environment.");
  }

  if (!cachedPdfjsPromise) {
    cachedPdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
      return pdfjs;
    });
  }

  return cachedPdfjsPromise;
}
