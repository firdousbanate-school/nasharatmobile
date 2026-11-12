import { isSameDay } from "./isSameDay";
import type { UnifiedCalendarItem } from "./types";

/** Items whose date falls on the same calendar day as `day` (local time). */
export function filterItemsByDay(items: UnifiedCalendarItem[], day: Date): UnifiedCalendarItem[] {
  return items.filter((item) => isSameDay(new Date(item.date), day));
}
