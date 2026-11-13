import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SchoolDocumentPreviewContent } from "./SchoolDocumentPreviewContent";
import type { SchoolDocumentRow } from "@/lib/documents/types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/pdf/fetchPdfDocument", () => ({
  fetchPdfDocument: () => new Promise(() => {}),
}));

const basePdfDoc: SchoolDocumentRow = {
  id: "doc-1",
  school_id: "school-1",
  slug: "operational-plan",
  title: "Operational Plan",
  description: "2026 Plan",
  file_path: "school-1/operational-plan/plan.pdf",
  file_name: "plan.pdf",
  file_size: 1024,
  mime_type: "application/pdf",
  file_url: "/api/documents/doc-1/preview",
  created_by: "user-1",
  created_at: "2026-11-12T00:00:00Z",
  updated_at: "2026-11-12T00:00:00Z",
  is_published: true,
};

describe("SchoolDocumentPreviewContent", () => {
  it("renders the universal in-app PDF viewer without iframes or target=_blank links", () => {
    const { container } = render(<SchoolDocumentPreviewContent currentDoc={basePdfDoc} />);

    expect(screen.getByLabelText("Operational Plan")).toBeInTheDocument();
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector('a[target="_blank"]')).toBeNull();
  });
});
