import type { NotificationFilter } from "./filterNotifications";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyNotificationFilter(query: any, filter: NotificationFilter) {
  if (filter === "unread") {
    return query.is("read_at", null);
  }
  if (filter !== "all") {
    return query.eq("type", filter);
  }
  return query;
}
