import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import { InAppPdfViewer } from "./InAppPdfViewer";

const mockFetchPdfDocument = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

vi.mock("@/lib/pdf/fetchPdfDocument", () => ({
  fetchPdfDocument: (...args: unknown[]) => mockFetchPdfDocument(...args),
}));

vi.mock("@/lib/pdf/loadPdfjs", () => ({
  loadPdfjs: async () => ({
    TextLayer: class {
      render = vi.fn().mockResolvedValue(undefined);
      cancel = vi.fn();
    },
  }),
}));

function makeMockDocument(pagesText: string[]) {
  const cleanupDoc = vi.fn().mockResolvedValue(undefined);
  const destroyTask = vi.fn().mockResolvedValue(undefined);

  const document = {
    numPages: pagesText.length,
    cleanup: cleanupDoc,
    getPage: vi.fn(async (pageNumber: number) => ({
      getViewport: ({ scale, rotation = 0 }: { scale: number; rotation?: number }) => ({
        width: 600 * scale,
        height: 800 * scale,
        scale,
        rotation,
      }),
      render: () => ({
        promise: Promise.resolve(),
        cancel: vi.fn(),
      }),
      getTextContent: async () => ({
        items: [{ str: pagesText[pageNumber - 1] ?? "" }],
      }),
    })),
  } as unknown as PDFDocumentProxy;

  const loadingTask = { destroy: destroyTask } as unknown as PDFDocumentLoadingTask;

  return { document, loadingTask, cleanupDoc, destroyTask };
}

describe("InAppPdfViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders multipage PDFs, supports navigation, zoom, search, and destroys resources on unmount", async () => {
    const mock = makeMockDocument(["Page one Arabic النص", "Page two target"]);
    mockFetchPdfDocument.mockResolvedValue({
      document: mock.document,
      loadingTask: mock.loadingTask,
    });

    const { unmount } = render(<InAppPdfViewer url="/api/documents/1/preview" title="Test PDF" />);

    await waitFor(() => {
      expect(screen.getByLabelText('pageLabel:{"page":1}')).toBeInTheDocument();
      expect(screen.getByLabelText('pageLabel:{"page":2}')).toBeInTheDocument();
    });

    // Next page navigation
    fireEvent.click(screen.getByRole("button", { name: "nextPage" }));
    const pageInput = screen.getByLabelText("pageInputLabel") as HTMLInputElement;
    expect(pageInput.value).toBe("2");

    // Zoom in increases scale by 25%
    const zoomReadout = screen.getByText(/^\d+%$/);
    const beforeZoom = Number.parseInt(zoomReadout.textContent ?? "0", 10);
    fireEvent.click(screen.getByRole("button", { name: "zoomIn" }));
    expect(Number.parseInt(zoomReadout.textContent ?? "0", 10)).toBe(beforeZoom + 25);

    // Open search and find text on page 2
    fireEvent.click(screen.getByRole("button", { name: "search" }));
    const searchInput = screen.getByRole("searchbox", { name: "search" });
    fireEvent.change(searchInput, { target: { value: "target" } });

    await waitFor(() => {
      expect(screen.getByText('matchCount:{"current":1,"total":1}')).toBeInTheDocument();
    });

    unmount();
    expect(mock.cleanupDoc).toHaveBeenCalledTimes(1);
    expect(mock.destroyTask).toHaveBeenCalledTimes(1);
  });

  it("shows expired-session message on 401 and retries cleanly", async () => {
    mockFetchPdfDocument.mockRejectedValueOnce({ status: 401 });
    const mock = makeMockDocument(["Recovered page"]);
    mockFetchPdfDocument.mockResolvedValueOnce({
      document: mock.document,
      loadingTask: mock.loadingTask,
    });

    render(<InAppPdfViewer url="/api/documents/1/preview" title="Protected PDF" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("errorUnauthorized");
    });

    fireEvent.click(screen.getByRole("button", { name: "retry" }));

    await waitFor(() => {
      expect(screen.getByLabelText('pageLabel:{"page":1}')).toBeInTheDocument();
    });
  });

  it("shows forbidden message on 403 and corrupted message on InvalidPDFException", async () => {
    mockFetchPdfDocument.mockRejectedValueOnce({ status: 403 });
    const { rerender } = render(
      <InAppPdfViewer url="/api/documents/1/preview" title="Forbidden PDF" />,
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("errorForbidden");
    });

    const invalidErr = new Error("Invalid PDF");
    invalidErr.name = "InvalidPDFException";
    mockFetchPdfDocument.mockRejectedValueOnce(invalidErr);

    rerender(<InAppPdfViewer url="/api/documents/2/preview" title="Broken PDF" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("errorCorrupted");
    });
  });
});
