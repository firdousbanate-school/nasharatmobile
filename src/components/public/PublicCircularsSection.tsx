"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { ArrowRightIcon } from "lucide-react";
import type { CircularRow } from "@/lib/circulars/types";
import { getCircularMonths } from "@/lib/circulars/getCircularMonths";
import { usePublicCircularFilters } from "./usePublicCircularFilters";
import { PublicCircularMonthSelect } from "./PublicCircularMonthSelect";
import { PublicCircularSearchInput } from "./PublicCircularSearchInput";
import { PublicCircularCard } from "./PublicCircularCard";
import { PublicCircularsEmptyState } from "./PublicCircularsEmptyState";
import { PublicCircularsEmptyFilter } from "./PublicCircularsEmptyFilter";
import { PublicCircularsSectionHeader } from "./PublicCircularsSectionHeader";

export function PublicCircularsSection({ circulars = [] }: { circulars?: CircularRow[] }) {
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

  const displayedCirculars = filteredCirculars.slice(0, 4);

  return (
    <section
      id="circulars"
      aria-label={t("circularsTitle")}
      className="border-t border-border/60 bg-muted/10 py-16 sm:py-20 px-4 sm:px-8 lg:px-12 xl:px-16"
    >
      <div className="mx-auto w-full max-w-[1520px] space-y-8 animate-hero-fade-up">
        <PublicCircularsSectionHeader />

        {circulars.length === 0 ? (
          <PublicCircularsEmptyState />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <PublicCircularSearchInput value={searchQuery} onChange={setSearchQuery} />
              <PublicCircularMonthSelect
                months={months}
                selectedMonth={selectedMonth}
                totalCount={circulars.length}
                onSelectMonth={setSelectedMonth}
              />
            </div>

            {filteredCirculars.length === 0 ? (
              <PublicCircularsEmptyFilter onReset={resetFilters} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-2">
                {displayedCirculars.map((circular) => (
                  <PublicCircularCard key={circular.id} circular={circular} locale={locale} />
                ))}
              </div>
            )}

            <div className="pt-4 text-center">
              <Link
                href="/public/circulars"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0c1f44] px-6 py-3 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#0b5cce] hover:shadow-md dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
              >
                <span>{t("viewAllArchiveWithCount", { count: circulars.length })}</span>
                <ArrowRightIcon className="size-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
