import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { UnifiedCalendarItem } from "@/lib/calendar/types";
import { PublicCalendarWidget } from "./PublicCalendarWidget";

// The item card links circulars to their public detail page through the
// next-intl navigation Link, which cannot be imported in the test environment.
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

const mockItems: UnifiedCalendarItem[] = [
  {
    kind: "event",
    id: "1",
    date: new Date().toISOString(),
    event: {
      id: "1",
      school_id: "s1",
      title_ar: "اختبارات منتصف الفصل الدراسي الأول",
      title_en: "Midterm Exams",
      description: "description",
      category: "exam",
      starts_at: new Date().toISOString(),
      ends_at: new Date().toISOString(),
      all_day: true,
      visibility: "public",
      status: "published",
      location: "القاعات الامتحانية",
      image_path: null,
      created_by: "u1",
      published_at: new Date().toISOString(),
      cancelled_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

describe("PublicCalendarWidget", () => {
  it("renders with header controls and items without crashing", () => {
    render(<PublicCalendarWidget items={mockItems} locale="ar" />);

    const todayBtn = screen.getByRole("button", {
      name: (name) => name.includes("اليوم") || name.toLowerCase().includes("today"),
    });

    expect(todayBtn).toBeInTheDocument();
  });

  it("opens the event detail dialog when clicking an event in upcoming events", () => {
    render(<PublicCalendarWidget items={mockItems} locale="ar" />);

    const eventCard = screen.getByRole("button", { name: /اختبارات منتصف الفصل الدراسي/ });
    fireEvent.click(eventCard);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByText("القاعات الامتحانية")).toHaveLength(2);
  });
});
