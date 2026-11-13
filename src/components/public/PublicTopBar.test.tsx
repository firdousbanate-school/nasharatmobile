import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PublicTopBar } from "./PublicTopBar";

vi.mock("next-intl", () => ({
  useLocale: () => "ar",
  useTranslations: () => (key: string) => {
    if (key === "portalSignIn") return "دخول منصة المدرسة";
    if (key === "title") return "مدرسة الفردوس";
    if (key === "subtitle") return "بوابة الإدارة المدرسية";
    return key;
  },
}));

vi.mock("@/components/layout/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
}));

vi.mock("@/components/theme/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

vi.mock("./PublicTopBarTicker", () => ({
  PublicTopBarTicker: () => <div data-testid="ticker" />,
}));

vi.mock("./KuwaitMoeLink", () => ({
  KuwaitMoeLink: () => <div data-testid="kuwait-moe" />,
}));

vi.mock("./PublicInstagramLink", () => ({
  PublicInstagramLink: () => <div data-testid="instagram-link" />,
}));

describe("PublicTopBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders school name, Kuwait MOE link, Instagram link, and the portal login button", () => {
    render(
      <PublicTopBar
        school={{
          id: "school-1",
          name_ar: "مدرسة الفردوس الابتدائية",
          name_en: "Al-Firdous Primary School",
          slug: "al-firdous",
          logo_path: null,
          timezone: "Asia/Kuwait",
          public_description: "وصف عام",
          vision: null,
          mission: null,
          objectives: null,
          instagram_url: "https://instagram.com/alfirdous",
        }}
        events={[]}
      />
    );

    expect(screen.getByText("مدرسة الفردوس الابتدائية")).toBeInTheDocument();
    const description = screen.getByText("وصف عام");
    expect(description).toBeInTheDocument();
    expect(description.className).toContain("hidden");
    expect(description.className).toContain("md:block");
    const kuwaitMoe = screen.getByTestId("kuwait-moe");
    expect(kuwaitMoe).toBeInTheDocument();
    expect(kuwaitMoe.parentElement?.className).toContain("flex-row");
    expect(kuwaitMoe.parentElement?.className).toContain("justify-between");
    expect(kuwaitMoe.parentElement?.className).toContain("md:flex-col");
    const instagramLink = screen.getByTestId("instagram-link");
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink.parentElement?.className).toContain("absolute");
    expect(instagramLink.parentElement?.className).toContain("end-0");
    expect(instagramLink.parentElement?.className).toContain("md:static");
    expect(instagramLink.parentElement?.parentElement?.className).toContain("justify-center");
    expect(screen.getByRole("link", { name: /دخول منصة المدرسة/ })).toBeInTheDocument();
  });
});
