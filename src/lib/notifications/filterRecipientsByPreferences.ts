import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationType } from "./types";

export interface FilteredNotificationRecipients {
  inAppUserIds: string[];
  pushUserIds: string[];
}

type PrefColumnMap = {
  inApp: "circular_in_app" | "maintenance_in_app" | "calendar_in_app";
  push: "circular_push" | "maintenance_push" | "calendar_push";
};

const TYPE_PREF_COLUMNS: Partial<Record<NotificationType, PrefColumnMap>> = {
  circular: { inApp: "circular_in_app", push: "circular_push" },
  maintenance: { inApp: "maintenance_in_app", push: "maintenance_push" },
  calendar: { inApp: "calendar_in_app", push: "calendar_push" },
};

export async function filterRecipientsByPreferences(
  adminClient: SupabaseClient,
  userIds: string[],
  type: NotificationType,
): Promise<FilteredNotificationRecipients> {
  const cols = TYPE_PREF_COLUMNS[type];
  if (!cols || userIds.length === 0) {
    return { inAppUserIds: userIds, pushUserIds: userIds };
  }

  const { data } = await adminClient
    .from("notification_preferences")
    .select(`user_id, ${cols.inApp}, ${cols.push}`)
    .in("user_id", userIds);

  const prefByUser = new Map<string, Record<string, unknown>>();
  for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
    if (typeof row.user_id === "string") {
      prefByUser.set(row.user_id, row);
    }
  }

  const inAppUserIds = userIds.filter((id) => prefByUser.get(id)?.[cols.inApp] !== false);
  const pushUserIds = userIds.filter((id) => prefByUser.get(id)?.[cols.push] !== false);

  return { inAppUserIds, pushUserIds };
}
