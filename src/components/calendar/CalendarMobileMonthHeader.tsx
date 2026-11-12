import { useLocale, useTranslations } from "next-intl";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

/** Month title with previous / today / next controls (44px touch targets). */
export function CalendarMobileMonthHeader({
  currentDate,
  onPrev,
  onNext,
  onToday,
}: {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const monthLabel = currentDate.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    month: "long",
    year: "numeric",
  });
  const navButton = "flex size-11 items-center justify-center rounded-full active:bg-muted";

  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-base font-bold text-foreground">{monthLabel}</h2>
      <div className="flex items-center">
        <button type="button" onClick={onToday} className="min-h-11 px-3 text-sm font-medium">
          {t("today")}
        </button>
        <button type="button" onClick={onPrev} className={navButton} aria-label="‹">
          <ChevronLeftIcon className="size-5 rtl:rotate-180" />
        </button>
        <button type="button" onClick={onNext} className={navButton} aria-label="›">
          <ChevronRightIcon className="size-5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
