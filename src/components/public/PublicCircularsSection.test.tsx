import React from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicCircularsSection } from "./PublicCircularsSection";
import type { CircularRow } from "@/lib/circulars/types";

vi.mock("next-intl", () => ({
  useLocale: () => "ar",
  useTranslations: (namespace?: string) => (key: string, values?: Record<string, unknown>) => {
    const messages: Record<string, string> = {
      circularsEyebrow: "إعلانات وقرارات رسمية",
      circularsTitle: "التعاميم المدرسية",
      circularsSubtitle: "أحدث التعاميم والقرارات المعتمدة الصادرة عن إدارة المدرسة",
      viewCircularAction: "عرض التعميم",
      noPublicCirculars: "لا توجد تعاميم عامة منشورة حالياً.",
      hasAttachments: "مرفق مستند",
      allMonths: "جميع الأشهر",
      selectMonth: "اختر الشهر",
      searchPlaceholder: "البحث في التعاميم بالاسم أو الرقم أو النص...",
      viewAllArchive: "عرض أرشيف التعاميم بالكامل",
      viewAllArchiveWithCount: values ? `عرض أرشيف التعاميم بالكامل (${values.count})` : "عرض أرشيف التعاميم بالكامل",
      noFilteredCirculars: "لا توجد تعاميم مطابقة لبحثك في هذه الفترة.",
      clearFilters: "إعادة تعيين التصفية",
      priorityNormal: "عادي",
      priorityUrgent: "عاجل",
      priorityHigh: "هام",
      priorityLow: "منخفض",
    };
    return messages[key] || `${namespace}.${key}`;
  },
}));

vi.mock("@/i18n", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const createMockCircular = (id: string, num: string, title: string, publishAt: string): CircularRow => ({
  id,
  school_id: "school-1",
  ref_number: num,
  title,
  body: `نص التعميم ${title}`,
  category: "admin",
  status: "published",
  priority: "normal",
  visibility: "public",
  response_type: "acknowledgement",
  response_instructions: null,
  allow_response_revision: false,
  publish_at: publishAt,
  due_at: null,
  created_by: "u-1",
  closed_at: null,
  created_at: publishAt,
});

describe("PublicCircularsSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the empty state when no circulars are provided", () => {
    render(<PublicCircularsSection circulars={[]} />);
    expect(screen.getByText("لا توجد تعاميم عامة منشورة حالياً.")).toBeDefined();
    expect(screen.getByText("التعاميم المدرسية")).toBeDefined();
  });

  it("renders circular cards and the archive link", () => {
    const circular = createMockCircular("circ-1", "CIR-2026-0001", "الخطة الدراسية الجديدة", "2026-11-10T10:00:00Z");
    render(<PublicCircularsSection circulars={[circular]} />);

    expect(screen.getAllByText("CIR-2026-0001").length).toBeGreaterThan(0);
    expect(screen.getByText("الخطة الدراسية الجديدة")).toBeDefined();
    expect(screen.getByText("عرض التعميم")).toBeDefined();

    const archiveLink = screen.getByRole("link", { name: /عرض أرشيف التعاميم بالكامل \(1\)/ });
    expect(archiveLink.getAttribute("href")).toBe("/public/circulars");
  });

  it("caps displayed cards to 4 on homepage and filters by search query", () => {
    const circulars = [
      createMockCircular("c-1", "CIR-01", "تعميم 1", "2026-11-01T10:00:00Z"),
      createMockCircular("c-2", "CIR-02", "تعميم 2", "2026-11-02T10:00:00Z"),
      createMockCircular("c-3", "CIR-03", "تعميم 3", "2026-11-03T10:00:00Z"),
      createMockCircular("c-4", "CIR-04", "تعميم 4", "2026-11-04T10:00:00Z"),
      createMockCircular("c-5", "CIR-05", "تعميم 5", "2026-11-05T10:00:00Z"),
    ];

    render(<PublicCircularsSection circulars={circulars} />);

    // First 4 are rendered, 5th is capped out
    expect(screen.getByText("تعميم 1")).toBeDefined();
    expect(screen.getByText("تعميم 2")).toBeDefined();
    expect(screen.getByText("تعميم 3")).toBeDefined();
    expect(screen.getByText("تعميم 4")).toBeDefined();
    expect(screen.queryByText("تعميم 5")).toBeNull();

    // Searching for "5" reveals circular 5
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "5" } });
    expect(screen.getByText("تعميم 5")).toBeDefined();
    expect(screen.queryByText("تعميم 1")).toBeNull();
  });

  it("filters circulars when month dropdown changes", () => {
    const circulars = [
      createMockCircular("c-1", "CIR-01", "تعميم نوفمبر", "2026-11-01T10:00:00Z"),
      createMockCircular("c-2", "CIR-02", "تعميم أكتوبر", "2026-10-02T10:00:00Z"),
    ];

    render(<PublicCircularsSection circulars={circulars} />);

    // Defaults to November (c-1)
    expect(screen.getByText("تعميم نوفمبر")).toBeDefined();
    expect(screen.queryByText("تعميم أكتوبر")).toBeNull();

    // Select October
    const select = screen.getByRole("combobox", { name: "اختر الشهر" });
    fireEvent.change(select, { target: { value: "2026-10" } });

    expect(screen.getByText("تعميم أكتوبر")).toBeDefined();
    expect(screen.queryByText("تعميم نوفمبر")).toBeNull();
  });
});
