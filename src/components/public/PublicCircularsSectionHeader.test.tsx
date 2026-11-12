import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PublicCircularsSectionHeader } from "./PublicCircularsSectionHeader";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      circularsEyebrow: "إعلانات وقرارات رسمية",
      circularsTitle: "التعاميم المدرسية",
      circularsSubtitle: "أحدث التعاميم والقرارات المعتمدة",
    };
    return map[key] ?? key;
  },
}));

describe("PublicCircularsSectionHeader", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders eyebrow, title, and subtitle", () => {
    render(<PublicCircularsSectionHeader />);
    expect(screen.getByText("إعلانات وقرارات رسمية")).toBeInTheDocument();
    expect(screen.getByText("التعاميم المدرسية")).toBeInTheDocument();
    expect(screen.getByText("أحدث التعاميم والقرارات المعتمدة")).toBeInTheDocument();
  });
});
