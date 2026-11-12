"use client";

import { useTranslations } from "next-intl";
import type { CircularMonthOption } from "@/lib/circulars/getCircularMonths";

export function PublicCircularMonthFilter({
  months,
  selectedMonth,
  totalCount,
  onSelectMonth,
}: {
  months: CircularMonthOption[];
  selectedMonth: string;
  totalCount: number;
  onSelectMonth: (monthKey: string) => void;
}) {
  const t = useTranslations("home");

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist">
      {months.map((month) => {
        const isSelected = selectedMonth === month.key;
        return (
          <button
            key={month.key}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectMonth(month.key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              isSelected
                ? "bg-[#0c1f44] text-white shadow-xs dark:bg-primary"
                : "border border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span>{month.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {month.count}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        role="tab"
        aria-selected={selectedMonth === "all"}
        onClick={() => onSelectMonth("all")}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          selectedMonth === "all"
            ? "bg-[#0c1f44] text-white shadow-xs dark:bg-primary"
            : "border border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
        }`}
      >
        <span>{t("allMonths")}</span>
        <span
          className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
            selectedMonth === "all"
              ? "bg-white/20 text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {totalCount}
        </span>
      </button>
    </div>
  );
}
