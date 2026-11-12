import { useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import { isWeekendDay } from "@/lib/calendar/isWeekendDay";

const SUNDAY = 7; // 7 Jan 2024 is a Sunday; used only to get localized weekday names

/** Localized short weekday row (Sunday first); weekend days follow the project's isWeekendDay rule. */
export function CalendarMobileWeekdays() {
  const intlLocale = useLocale() === "ar" ? "ar-EG" : "en-US";

  return (
    <div className="mt-2 grid grid-cols-7 text-center text-[11px] font-semibold">
      {Array.from({ length: 7 }, (_, idx) => {
        const date = new Date(2024, 0, SUNDAY + idx);
        return (
          <span
            key={idx}
            className={cn(
              "truncate",
              isWeekendDay(date) ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
            )}
          >
            {date.toLocaleDateString(intlLocale, { weekday: "short" })}
          </span>
        );
      })}
    </div>
  );
}
