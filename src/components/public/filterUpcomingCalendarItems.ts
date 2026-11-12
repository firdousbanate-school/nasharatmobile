import type { UnifiedCalendarItem } from "@/lib/calendar/types";
import { getKuwaitDateParts } from "@/lib/calendar/getKuwaitDateParts";

export interface FilteredUpcomingResult {
  displayItems: UnifiedCalendarItem[];
  isShowingFallback: boolean;
}

export function filterUpcomingCalendarItems(
  items: UnifiedCalendarItem[],
  selectedDate: Date | null,
  limit = 6,
): FilteredUpcomingResult {
  if (!selectedDate) {
    return {
      displayItems: items.slice(0, limit),
      isShowingFallback: false,
    };
  }

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  const selectedDay = selectedDate.getDate();

  const matched = items.filter((item) => {
    const itemParts = getKuwaitDateParts(item.date);
    return (
      itemParts.year === selectedYear &&
      itemParts.month === selectedMonth &&
      itemParts.day === selectedDay
    );
  });

  if (matched.length > 0) {
    return {
      displayItems: matched.slice(0, limit),
      isShowingFallback: false,
    };
  }

  return {
    displayItems: items.slice(0, limit),
    isShowingFallback: true,
  };
}

