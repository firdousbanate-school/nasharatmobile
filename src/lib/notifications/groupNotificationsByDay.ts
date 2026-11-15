import type { NotificationRow } from "./types";

export interface NotificationDayGroups {
  today: NotificationRow[];
  earlier: NotificationRow[];
}

export function groupNotificationsByDay(
  notifications: NotificationRow[],
  now: Date = new Date(),
): NotificationDayGroups {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const today: NotificationRow[] = [];
  const earlier: NotificationRow[] = [];

  for (const item of notifications) {
    const createdMs = new Date(item.created_at).getTime();
    if (!Number.isNaN(createdMs) && createdMs >= startOfToday) {
      today.push(item);
    } else {
      earlier.push(item);
    }
  }

  return { today, earlier };
}
