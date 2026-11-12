import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { PublicCircularsEmptyFilter } from "./PublicCircularsEmptyFilter";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key === "noFilteredCirculars") return "لا توجد تعاميم مطابقة";
    if (key === "clearFilters") return "إعادة تعيين التصفية";
    return key;
  },
}));

describe("PublicCircularsEmptyFilter", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders message and calls onReset on button click", () => {
    const handleReset = vi.fn();
    render(<PublicCircularsEmptyFilter onReset={handleReset} />);

    expect(screen.getByText("لا توجد تعاميم مطابقة")).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: "إعادة تعيين التصفية" });
    fireEvent.click(btn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
