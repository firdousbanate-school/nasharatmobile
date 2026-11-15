"use server";

import { getUserNotifications } from "@/lib/notifications/getUserNotifications";
import type { NotificationFilter } from "@/lib/notifications/filterNotifications";
import type { NotificationRow } from "@/lib/notifications/types";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";

export async function loadMoreNotificationsAction(params: {
  offset: number;
  limit?: number;
  filter?: NotificationFilter;
}): Promise<ActionResult<{ notifications: NotificationRow[]; hasMore: boolean }>> {
  try {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 50);
    const offset = Math.max(params.offset, 0);
    const filter = params.filter ?? "all";

    const rows = await getUserNotifications(limit + 1, offset, filter);
    const hasMore = rows.length > limit;
    const notifications = hasMore ? rows.slice(0, limit) : rows;

    return { success: true, notifications, hasMore };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
