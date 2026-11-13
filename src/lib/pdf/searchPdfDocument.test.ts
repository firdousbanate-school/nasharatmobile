import { describe, expect, it, vi } from "vitest";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { searchPdfDocument } from "./searchPdfDocument";

function createMockPdfDoc(pagesText: string[]): PDFDocumentProxy {
  return {
    numPages: pagesText.length,
    getPage: vi.fn(async (pageNumber: number) => ({
      getTextContent: async () => ({
        items: [{ str: pagesText[pageNumber - 1] ?? "" }],
      }),
    })),
  } as unknown as PDFDocumentProxy;
}

describe("searchPdfDocument", () => {
  it("finds case-insensitive and Arabic/Unicode matches across multiple pages", async () => {
    const doc = createMockPdfDoc([
      "School Operational Plan 2026 — الخطة التشغيلية",
      "Budget summary and operational milestones",
      "الخطة التشغيلية للمدرسة",
    ]);

    const enMatches = await searchPdfDocument(doc, "operational");
    expect(enMatches).toEqual([
      { pageNumber: 1, matchIndex: 0 },
      { pageNumber: 2, matchIndex: 0 },
    ]);

    const arMatches = await searchPdfDocument(doc, "الخطة التشغيلية");
    expect(arMatches).toEqual([
      { pageNumber: 1, matchIndex: 0 },
      { pageNumber: 3, matchIndex: 0 },
    ]);
  });

  it("returns empty array for blank queries or aborted searches", async () => {
    const doc = createMockPdfDoc(["Sample text"]);
    expect(await searchPdfDocument(doc, "   ")).toEqual([]);

    const controller = new AbortController();
    controller.abort();
    expect(await searchPdfDocument(doc, "Sample", controller.signal)).toEqual([]);
  });
});
