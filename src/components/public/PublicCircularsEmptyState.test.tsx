import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PublicCircularsEmptyState } from "./PublicCircularsEmptyState";

vi.mock("next-intl", () => ({
  useTranslations: () => () => "لا توجد تعاميم عامة منشورة حالياً.",
}));

describe("PublicCircularsEmptyState", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders empty state message", () => {
    render(<PublicCircularsEmptyState />);
    expect(screen.getByText("لا توجد تعاميم عامة منشورة حالياً.")).toBeInTheDocument();
  });
});
