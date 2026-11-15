import type { SupabaseClient } from "@supabase/supabase-js";
import { logError } from "@/lib/logger/logError";
import { getThrottledRecipientIds } from "./getThrottledRecipientIds";
import type { NotificationEntityKind, NotificationType } from "./types";

export async function insertBatchNotificationRecords(
  supabase: SupabaseClient,
  params: {
    userIds: string[];
    schoolId: string;
    type: NotificationType;
    title: string;
    body?: string | null;
    entityType?: NotificationEntityKind | null;
    entityId?: string | null;
    skipThrottle?: boolean;
  },
): Promise<number> {
  const { userIds, schoolId, type, title, body, entityType, entityId, skipThrottle } = params;

  const throttledIds = await getThrottledRecipientIds(supabase, {
    userIds,
    type,
    entityType,
    entityId,
    skipThrottle,
  });

  const targetUserIds = userIds.filter((id) => !throttledIds.has(id));
  if (targetUserIds.length === 0) {
    return 0;
  }

  const rows = targetUserIds.map((userId) => ({
    user_id: userId,
    school_id: schoolId,
    type,
    title,
    body: body ?? null,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) {
    logError(error, { scope: "insertBatchNotificationRecords", schoolId });
    return 0;
  }

  return rows.length;
}
