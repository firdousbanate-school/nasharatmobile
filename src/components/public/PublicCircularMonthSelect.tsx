"use client";

import { useTranslations } from "next-intl";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import type { CircularMonthOption } from "@/lib/circulars/getCircularMonths";

export function PublicCircularMonthSelect({
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
    <div className="relative inline-flex items-center w-full sm:w-auto">
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-muted-foreground">
        <CalendarIcon className="size-4" aria-hidden="true" />
      </div>

      <select
        value={selectedMonth}
        onChange={(e) => onSelectMonth(e.target.value)}
        aria-label={t("selectMonth")}
        className="h-10 w-full sm:w-64 appearance-none rounded-xl border border-border/70 bg-card pe-9 ps-10 text-xs sm:text-sm font-semibold text-foreground shadow-xs transition-all hover:border-primary/40 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 cursor-pointer"
      >
        <option value="all">
          {t("allMonths")} ({totalCount})
        </option>
        {months.map((month) => (
          <option key={month.key} value={month.key}>
            {month.label} ({month.count})
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3.5 text-muted-foreground">
        <ChevronDownIcon className="size-4" aria-hidden="true" />
      </div>
    </div>
  );
}
