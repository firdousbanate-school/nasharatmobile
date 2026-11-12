import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PublicHeroCardsGrid } from "./PublicHeroCardsGrid";

vi.mock("next-intl", () => ({
  useLocale: () => "ar",
  useTranslations: () => (key: string) => key,
}));

describe("PublicHeroCardsGrid", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders vision, leadership, and mission without the old hero login button", () => {
    render(
      <PublicHeroCardsGrid
        school={{
          id: "school-1",
          name_ar: "مدرسة الفردوس",
          name_en: "Al-Firdous School",
          slug: "al-firdous",
          logo_path: null,
          timezone: "Asia/Kuwait",
          public_description: null,
          vision: null,
          mission: null,
          objectives: null,
          vision_ar: "رؤية المدرسة",
          vision_en: null,
          mission_ar: "رسالة المدرسة",
          mission_en: null,
          manager_name_ar: "أ. مستورة المطيري",
          manager_name_en: null,
          assistant_manager_ar: "أ. فاطمة المطيري",
          assistant_manager_en: null,
          assistant_manager_2_ar: "أ. أنوار المطيري",
          assistant_manager_2_en: null,
          assistant_manager_3_ar: "أ. منيرة الحربي",
          assistant_manager_3_en: null,
        }}
      />
    );

    expect(screen.getByText("رؤية المدرسة")).toBeInTheDocument();
    expect(screen.getByText("أ. مستورة المطيري")).toBeInTheDocument();
    expect(screen.getByText("أ. فاطمة المطيري")).toBeInTheDocument();
    expect(screen.getByText("أ. أنوار المطيري")).toBeInTheDocument();
    expect(screen.getByText("أ. منيرة الحربي")).toBeInTheDocument();
    expect(screen.getByText("رسالة المدرسة")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /portalSignIn/ })).not.toBeInTheDocument();
  });
});
