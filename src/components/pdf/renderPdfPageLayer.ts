import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { loadPdfjs } from "@/lib/pdf/loadPdfjs";
import type { PdfRotation } from "@/lib/pdf/types";
import { highlightTextLayer } from "./highlightTextLayer";

interface RenderPdfPageOptions {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  rotation: PdfRotation;
  canvas: HTMLCanvasElement;
  textContainer: HTMLDivElement;
  searchQuery: string;
  activePageMatchIndex: number | null;
  onResize: (dims: { width: number; height: number }) => void;
  isCancelled: () => boolean;
  onRegisterCancel: (cancel: () => void) => void;
}

export async function renderPdfPageLayer(opts: RenderPdfPageOptions): Promise<void> {
  const [page, pdfjs] = await Promise.all([opts.pdfDoc.getPage(opts.pageNumber), loadPdfjs()]);
  if (opts.isCancelled()) return;

  const viewport = page.getViewport({ scale: opts.scale, rotation: opts.rotation });
  const outputScale = Math.min(window.devicePixelRatio || 1, 2);
  opts.onResize({
    width: Math.ceil(viewport.width),
    height: Math.ceil(viewport.height),
  });

  opts.canvas.width = Math.floor(viewport.width * outputScale);
  opts.canvas.height = Math.floor(viewport.height * outputScale);
  opts.canvas.style.width = `${viewport.width}px`;
  opts.canvas.style.height = `${viewport.height}px`;

  const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

  const renderTask: RenderTask = page.render({
    canvas: opts.canvas,
    viewport,
    transform,
  });
  let textLayer: { cancel: () => void; render: () => Promise<void> } | null = null;
  opts.onRegisterCancel(() => {
    renderTask.cancel();
    textLayer?.cancel();
  });

  await renderTask.promise;
  if (opts.isCancelled()) return;

  opts.textContainer.replaceChildren();
  opts.textContainer.style.setProperty("--total-scale-factor", String(viewport.scale));
  opts.textContainer.style.width = `${viewport.width}px`;
  opts.textContainer.style.height = `${viewport.height}px`;

  const textContent = await page.getTextContent();
  if (opts.isCancelled()) return;

  textLayer = new pdfjs.TextLayer({
    textContentSource: textContent,
    container: opts.textContainer,
    viewport,
  });
  await textLayer.render();

  if (!opts.isCancelled()) {
    highlightTextLayer(opts.textContainer, opts.searchQuery, opts.activePageMatchIndex);
  }
}
