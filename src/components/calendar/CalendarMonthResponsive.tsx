"use client";

import { CalendarMobileMonth } from "./CalendarMobileMonth";
import { CalendarMonthView } from "./CalendarMonthView";
import type { UnifiedCalendarItem } from "@/lib/calendar/types";

/** Month view: the original grid from md up, the compact phone month + day agenda below md. */
export function CalendarMonthResponsive({
  items,
  canManage,
  onSelectItem,
  onViewMore,
}: {
  items: UnifiedCalendarItem[];
  canManage: boolean;
  onSelectItem: (item: UnifiedCalendarItem) => void;
  onViewMore: () => void;
}) {
  return (
    <>
      <div className="hidden md:block">
        <CalendarMonthView items={items} onSelectItem={onSelectItem} onViewMore={onViewMore} />
      </div>
      <div className="md:hidden">
        <CalendarMobileMonth items={items} canManage={canManage} onSelectItem={onSelectItem} />
      </div>
    </>
  );
}
