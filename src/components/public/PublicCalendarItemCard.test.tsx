import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UnifiedCalendarItem } from "@/lib/calendar/types";
import { PublicCalendarItemCard } from "./PublicCalendarItemCard";

vi.mock("@/i18n", () => ({
  Link: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe("PublicCalendarItemCard", () => {
  it("renders event title and category properly in Arabic", () => {
    const item: UnifiedCalendarItem = {
      kind: "event",
      id: "ev-1",
      date: "2026-11-01T08:00:00Z",
      event: {
        id: "ev-1",
        school_id: "s-1",
        title_ar: "اختبارات منتصف الفصل الدراسي",
        title_en: "Midterm Exams",
        description: null,
        category: "exam",
        starts_at: "2026-11-01T08:00:00Z",
        ends_at: "2026-11-01T12:00:00Z",
        all_day: false,
        visibility: "public",
        status: "published",
        location: "القاعات الامتحانية",
        image_path: null,
        created_by: "user-1",
        published_at: "2026-10-01T00:00:00Z",
        cancelled_at: null,
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      },
    };

    render(<PublicCalendarItemCard item={item} locale="ar" />);

    expect(screen.getByText("اختبارات منتصف الفصل الدراسي")).toBeInTheDocument();
    expect(screen.getByText("القاعات الامتحانية")).toBeInTheDocument();
    expect(screen.getByText("امتحانات عامة")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("NOV")).toBeInTheDocument();
  });

  it("renders circular as public bulletin card", () => {
    const item: UnifiedCalendarItem = {
      kind: "circular",
      id: "circ-1",
      date: "2026-11-15T00:00:00Z",
      circular: {
        id: "circ-1",
        school_id: "s-1",
        ref_number: "CIRC-2026-001",
        title: "نشرة توعوية حول الاختبارات",
        body: "تفاصيل النشرة التوعوية",
        category: "bulletin",
        priority: "normal",
        status: "published",
        visibility: "public",
        response_type: "acknowledgement",
        response_instructions: null,
        allow_response_revision: false,
        publish_at: "2026-11-15T00:00:00Z",
        due_at: null,
        created_by: "admin-1",
        closed_at: null,
        created_at: "2026-11-15T00:00:00Z",
      },
    };

    render(<PublicCalendarItemCard item={item} locale="ar" />);

    expect(screen.getByText("نشرة توعوية حول الاختبارات")).toBeInTheDocument();
    expect(screen.getByText("CIRC-2026-001")).toBeInTheDocument();
    expect(screen.getByText("نشرة عامة")).toBeInTheDocument();
  });

  it("links a circular card to its public detail page", () => {
    const item: UnifiedCalendarItem = {
      kind: "circular",
      id: "circ-42",
      date: "2026-11-15T00:00:00Z",
      circular: {
        id: "circ-42",
        school_id: "s-1",
        ref_number: "CIRC-2026-042",
        title: "نشرة عامة",
        body: "body",
        category: "bulletin",
        priority: "normal",
        status: "published",
        visibility: "public",
        response_type: "acknowledgement",
        response_instructions: null,
        allow_response_revision: false,
        publish_at: "2026-11-15T00:00:00Z",
        due_at: null,
        created_by: "admin-1",
        closed_at: null,
        created_at: "2026-11-15T00:00:00Z",
      },
    };

    render(<PublicCalendarItemCard item={item} locale="ar" />);

    const link = screen.getByRole("link", { name: "نشرة عامة" });
    expect(link).toHaveAttribute("href", "/public/circulars/circ-42");
  });

  it("renders an event card as a button that calls onSelect when clicked", () => {
    const handleSelect = vi.fn();
    const item: UnifiedCalendarItem = {
      kind: "event",
      id: "ev-2",
      date: "2026-11-01T08:00:00Z",
      event: {
        id: "ev-2",
        school_id: "s-1",
        title_ar: "اجتماع",
        title_en: "Meeting",
        description: null,
        category: "meeting",
        starts_at: "2026-11-01T08:00:00Z",
        ends_at: "2026-11-01T12:00:00Z",
        all_day: false,
        visibility: "public",
        status: "published",
        location: "القاعة",
        image_path: null,
        created_by: "user-1",
        published_at: "2026-10-01T00:00:00Z",
        cancelled_at: null,
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      },
    };

    render(<PublicCalendarItemCard item={item} locale="ar" onSelect={handleSelect} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    const button = screen.getByRole("button", { name: "اجتماع" });
    expect(button).toBeInTheDocument();
    button.click();
    expect(handleSelect).toHaveBeenCalledWith(item);
  });
});
