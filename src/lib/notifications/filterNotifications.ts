import type { NotificationRow } from "./types";

export type NotificationFilter = "all" | "unread" | "circular" | "maintenance" | "calendar";

export function filterNotifications(
  notifications: NotificationRow[],
  filter: NotificationFilter,
): NotificationRow[] {
  if (filter === "all") {
    return notifications;
  }

  if (filter === "unread") {
    return notifications.filter((item) => !item.read_at);
  }

  return notifications.filter((item) => item.type === filter);
}
