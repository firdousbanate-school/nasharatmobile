"use client";

import { useState } from "react";
import type { UnifiedCalendarItem } from "@/lib/calendar/types";
import { getKuwaitDateParts } from "@/lib/calendar/getKuwaitDateParts";
import { PublicCalendarTopBar } from "./PublicCalendarTopBar";
import { PublicCalendarUpcomingList } from "./PublicCalendarUpcomingList";
import { PublicCalendarMonthGrid } from "./PublicCalendarMonthGrid";
import { PublicCalendarEventDetailDialog } from "./PublicCalendarEventDetailDialog";

interface PublicCalendarWidgetProps {
  items: UnifiedCalendarItem[];
  locale: string;
}

export function PublicCalendarWidget({ items, locale }: PublicCalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const { year, month } = getKuwaitDateParts(new Date());
    return new Date(year, month, 15);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedItem, setSelectedItem] = useState<UnifiedCalendarItem | null>(null);

  const handlePrevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 15));
  };

  const handleNextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 15));
  };

  const handleToday = () => {
    const { year, month, day } = getKuwaitDateParts(new Date());
    setCurrentDate(new Date(year, month, 15));
    setSelectedDate(new Date(year, month, day));
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-slate-800 dark:bg-card">
      <PublicCalendarTopBar
        currentDate={currentDate}
        locale={locale}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <PublicCalendarUpcomingList
            items={items}
            selectedDate={selectedDate}
            locale={locale}
            onClearDateFilter={() => setSelectedDate(null)}
            onSelectItem={setSelectedItem}
          />
        </div>
        <div className="lg:col-span-7">
          <PublicCalendarMonthGrid
            currentDate={currentDate}
            items={items}
            selectedDate={selectedDate}
            locale={locale}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>

      {selectedItem && (
        <PublicCalendarEventDetailDialog
          item={selectedItem}
          isOpen={true}
          locale={locale}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

