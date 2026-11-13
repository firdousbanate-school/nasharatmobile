import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfSearchMatch } from "./types";

/**
 * Searches case-insensitively across all pages of a PDF document and returns ordered matches.
 */
export async function searchPdfDocument(
  document: PDFDocumentProxy,
  rawQuery: string,
  signal?: AbortSignal,
): Promise<PdfSearchMatch[]> {
  const query = rawQuery.trim().toLocaleLowerCase();
  if (!query) return [];

  const matches: PdfSearchMatch[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    if (signal?.aborted) return [];

    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .toLocaleLowerCase();

    let searchFrom = 0;
    let matchIndex = 0;
    while (true) {
      const foundAt = pageText.indexOf(query, searchFrom);
      if (foundAt === -1) break;
      matches.push({ pageNumber, matchIndex });
      matchIndex += 1;
      searchFrom = foundAt + query.length;
    }
  }

  return matches;
}
