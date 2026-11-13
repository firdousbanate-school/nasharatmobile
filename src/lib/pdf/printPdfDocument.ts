import type { PDFDocumentProxy } from "pdfjs-dist";

/**
 * Renders PDF pages to images inside a hidden print iframe without opening a new tab.
 */
export async function printPdfDocument(
  pdfDoc: PDFDocumentProxy,
  title = "document.pdf",
): Promise<void> {
  const pageImages: string[] = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvas, viewport }).promise;
    pageImages.push(canvas.toDataURL("image/png"));
    canvas.width = 0;
    canvas.height = 0;
  }

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument;
  if (!iframeDoc) {
    iframe.remove();
    return;
  }

  iframeDoc.open();
  iframeDoc.write(`<!DOCTYPE html><html><head><title>${title.replace(/</g, "&lt;")}</title><style>
    @page { margin: 0; }
    body { margin: 0; padding: 0; background: #fff; }
    img { display: block; width: 100%; height: auto; page-break-after: always; }
    img:last-child { page-break-after: auto; }
  </style></head><body></body></html>`);
  iframeDoc.close();

  for (const src of pageImages) {
    const img = iframeDoc.createElement("img");
    img.src = src;
    iframeDoc.body.appendChild(img);
  }

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();
  setTimeout(() => iframe.remove(), 60000);
}
