"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { filterItemsByDay } from "@/lib/calendar/filterItemsByDay";
import { isSameDay } from "@/lib/calendar/isSameDay";
import { isWeekendDay } from "@/lib/calendar/isWeekendDay";
import { CalendarListView } from "./CalendarListView";
import { CalendarMobileDayCell } from "./CalendarMobileDayCell";
import { CalendarMobileMonthHeader } from "./CalendarMobileMonthHeader";
import { CalendarMobileWeekdays } from "./CalendarMobileWeekdays";
import type { UnifiedCalendarItem } from "@/lib/calendar/types";

/** Phone month view: compact grid with dots, and the selected day's items listed below. */
export function CalendarMobileMonth({
  items,
  canManage,
  onSelectItem,
}: {
  items: UnifiedCalendarItem[];
  canManage: boolean;
  onSelectItem?: (item: UnifiedCalendarItem) => void;
}) {
  const intlLocale = useLocale() === "ar" ? "ar-EG" : "en-US";
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const goToMonth = (target: Date) => {
    setCurrentDate(target);
    setSelected(target);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
        <CalendarMobileMonthHeader
          currentDate={currentDate}
          onPrev={() => goToMonth(new Date(year, month - 1, 1))}
          onNext={() => goToMonth(new Date(year, month + 1, 1))}
          onToday={() => goToMonth(new Date())}
        />
        <CalendarMobileWeekdays />
        <div className="mt-1 grid grid-cols-7">
          {Array.from({ length: firstDayIndex }, (_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: totalDays }, (_, i) => {
            const date = new Date(year, month, i + 1);
            return (
              <CalendarMobileDayCell
                key={i}
                day={i + 1}
                label={date.toLocaleDateString(intlLocale, { dateStyle: "full" })}
                isToday={isSameDay(date, today)}
                isSelected={isSameDay(date, selected)}
                isWeekend={isWeekendDay(date)}
                itemCount={filterItemsByDay(items, date).length}
                onSelect={() => setSelected(date)}
              />
            );
          })}
        </div>
      </div>

      <CalendarListView
        items={filterItemsByDay(items, selected)}
        canManage={canManage}
        onSelectItem={onSelectItem}
      />
    </div>
  );
}
