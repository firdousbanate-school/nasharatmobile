"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { RotateCcwIcon } from "lucide-react";
import type { CircularRow } from "@/lib/circulars/types";
import { getCircularMonths } from "@/lib/circulars/getCircularMonths";
import { usePublicCircularFilters } from "./usePublicCircularFilters";
import { PublicCircularMonthSelect } from "./PublicCircularMonthSelect";
import { PublicCircularSearchInput } from "./PublicCircularSearchInput";
import { PublicCircularCard } from "./PublicCircularCard";
import { PublicCircularsEmptyState } from "./PublicCircularsEmptyState";
import { PublicCircularsEmptyFilter } from "./PublicCircularsEmptyFilter";

export function PublicCircularsArchive({
  circulars = [],
}: {
  circulars?: CircularRow[];
}) {
  const locale = useLocale();
  const t = useTranslations("home");

  const months = useMemo(() => getCircularMonths(circulars, locale), [circulars, locale]);
  const defaultMonth = months.find((m) => m.count > 0)?.key ?? months[0]?.key ?? "all";
  const {
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,
    filteredCirculars,
    resetFilters,
  } = usePublicCircularFilters(circulars, defaultMonth);

  if (circulars.length === 0) {
    return <PublicCircularsEmptyState />;
  }

  const isFiltered = selectedMonth !== defaultMonth || searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5 shadow-xs md:flex-row md:items-center md:justify-between">
        <PublicCircularSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <PublicCircularMonthSelect
            months={months}
            selectedMonth={selectedMonth}
            totalCount={circulars.length}
            onSelectMonth={setSelectedMonth}
          />

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-muted-foreground">
              {t("showingCount", {
                shown: filteredCirculars.length,
                total: circulars.length,
              })}
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <RotateCcwIcon className="size-3.5" aria-hidden="true" />
                <span>{t("clearFilters")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredCirculars.length === 0 ? (
        <PublicCircularsEmptyFilter onReset={resetFilters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch pt-2">
          {filteredCirculars.map((circular) => (
            <PublicCircularCard key={circular.id} circular={circular} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
