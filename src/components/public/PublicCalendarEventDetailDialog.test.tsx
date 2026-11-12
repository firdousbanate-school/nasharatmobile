import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UnifiedCalendarItem } from "@/lib/calendar/types";
import { PublicCalendarEventDetailDialog } from "./PublicCalendarEventDetailDialog";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      allDayBadge: "طوال اليوم",
      startsAt: "تاريخ البدء",
      endsAt: "تاريخ الانتهاء",
      eventDescription: "وصف الفعالية",
      close: "إغلاق",
    };
    return map[key] ?? key;
  },
}));

afterEach(() => {
  cleanup();
});

describe("PublicCalendarEventDetailDialog", () => {
  const mockItem: UnifiedCalendarItem = {
    kind: "event",
    id: "ev-10",
    date: "2026-11-15T09:00:00Z",
    event: {
      id: "ev-10",
      school_id: "s-1",
      title_ar: "المعرض السنوي للعلوم ومشاريع الروبوت",
      title_en: "Annual Science & Robotics Fair",
      description: "معرض شامل لمشاريع الطلاب المبتكرة في مجالات الذكاء الاصطناعي والروبوت.",
      category: "activity",
      starts_at: "2026-11-15T09:00:00Z",
      ends_at: "2026-11-15T12:00:00Z",
      all_day: false,
      visibility: "public",
      status: "published",
      location: "مسرح المدرسة الرئيسي",
      image_path: null,
      created_by: "user-1",
      published_at: "2026-11-01T00:00:00Z",
      cancelled_at: null,
      created_at: "2026-11-01T00:00:00Z",
      updated_at: "2026-11-01T00:00:00Z",
    },
  };

  it("returns null when not open", () => {
    const { container } = render(
      <PublicCalendarEventDetailDialog
        item={mockItem}
        isOpen={false}
        locale="ar"
        onClose={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders event details properly when open", () => {
    const handleClose = vi.fn();
    render(
      <PublicCalendarEventDetailDialog
        item={mockItem}
        isOpen={true}
        locale="ar"
        onClose={handleClose}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("المعرض السنوي للعلوم ومشاريع الروبوت")).toBeInTheDocument();
    expect(screen.getByText("مسرح المدرسة الرئيسي")).toBeInTheDocument();
    expect(
      screen.getByText("معرض شامل لمشاريع الطلاب المبتكرة في مجالات الذكاء الاصطناعي والروبوت."),
    ).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button", { name: "إغلاق" });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
