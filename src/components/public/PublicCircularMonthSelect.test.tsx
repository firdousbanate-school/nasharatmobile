import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { PublicCircularMonthSelect } from "./PublicCircularMonthSelect";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key === "selectMonth") return "اختر الشهر";
    if (key === "allMonths") return "جميع الأشهر";
    return key;
  },
}));

describe("PublicCircularMonthSelect", () => {
  afterEach(() => {
    cleanup();
  });

  const mockMonths = [
    { key: "2026-11", label: "نوفمبر 2026", count: 5 },
    { key: "2026-10", label: "أكتوبر 2026", count: 2 },
  ];

  it("renders months and triggers onSelectMonth on change", () => {
    const handleSelect = vi.fn();
    render(
      <PublicCircularMonthSelect
        months={mockMonths}
        selectedMonth="all"
        totalCount={7}
        onSelectMonth={handleSelect}
      />
    );

    const select = screen.getByRole("combobox", { name: "اختر الشهر" });
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "2026-11" } });
    expect(handleSelect).toHaveBeenCalledWith("2026-11");
  });
});
