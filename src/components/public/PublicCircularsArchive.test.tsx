import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { PublicCircularsArchive } from "./PublicCircularsArchive";
import type { CircularRow } from "@/lib/circulars/types";

vi.mock("next-intl", () => ({
  useLocale: () => "ar",
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (values && "shown" in values && "total" in values) {
      return `Showing ${values.shown} of ${values.total}`;
    }
    return key;
  },
}));

vi.mock("@/i18n", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockCirculars: CircularRow[] = [
  {
    id: "circ-1",
    school_id: "sch-1",
    ref_number: "CIR-2026-0001",
    title: "تعميم رقم واحد",
    body: "تفاصيل التعميم الأول",
    category: "general",
    status: "published",
    priority: "normal",
    visibility: "public",
    response_type: "acknowledgement",
    response_instructions: null,
    allow_response_revision: false,
    publish_at: "2026-11-01T08:00:00Z",
    due_at: null,
    created_by: "usr-1",
    closed_at: null,
    created_at: "2026-11-01T08:00:00Z",
  },
  {
    id: "circ-2",
    school_id: "sch-1",
    ref_number: "CIR-2026-0002",
    title: "تعميم رقم اثنين",
    body: "تفاصيل التعميم الثاني",
    category: "urgent",
    status: "published",
    priority: "urgent",
    visibility: "public",
    response_type: "acknowledgement",
    response_instructions: null,
    allow_response_revision: false,
    publish_at: "2026-10-15T08:00:00Z",
    due_at: null,
    created_by: "usr-1",
    closed_at: null,
    created_at: "2026-10-15T08:00:00Z",
  },
];

describe("PublicCircularsArchive", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty state when there are no circulars", () => {
    render(<PublicCircularsArchive circulars={[]} />);
    expect(screen.getByText("noPublicCirculars")).toBeInTheDocument();
  });

  it("defaults to latest month and displays all when allMonths is selected", () => {
    render(<PublicCircularsArchive circulars={mockCirculars} />);

    // Defaults to latest month with circulars (November 2026 -> circ-1)
    expect(screen.getByText("تعميم رقم واحد")).toBeInTheDocument();
    expect(screen.queryByText("تعميم رقم اثنين")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 2")).toBeInTheDocument();

    // Select All Months from the dropdown
    const select = screen.getByRole("combobox", { name: "selectMonth" });
    fireEvent.change(select, { target: { value: "all" } });

    expect(screen.getByText("تعميم رقم واحد")).toBeInTheDocument();
    expect(screen.getByText("تعميم رقم اثنين")).toBeInTheDocument();
    expect(screen.getByText("Showing 2 of 2")).toBeInTheDocument();
  });

  it("shows no-results state when search does not match", () => {
    render(<PublicCircularsArchive circulars={mockCirculars} />);

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "غير موجود" } });

    expect(screen.getByText("noFilteredCirculars")).toBeInTheDocument();
  });
});
