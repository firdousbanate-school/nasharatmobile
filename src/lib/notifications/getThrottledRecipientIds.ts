import type { SupabaseClient } from "@supabase/supabase-js";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { shouldThrottleNotification } from "./shouldThrottleNotification";
import type { NotificationEntityKind, NotificationType } from "./types";

export async function getThrottledRecipientIds(
  supabase: SupabaseClient,
  params: {
    userIds: string[];
    type: NotificationType;
    entityType?: NotificationEntityKind | null;
    entityId?: string | null;
    skipThrottle?: boolean;
  },
): Promise<Set<string>> {
  const { userIds, type, entityType, entityId, skipThrottle } = params;
  if (skipThrottle || !entityType || !entityId || userIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("user_id, created_at")
    .in("user_id", userIds)
    .eq("type", type)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .is("read_at", null);

  if (error) {
    throw mapDatabaseError(error);
  }

  const throttled = new Set<string>();
  for (const row of data ?? []) {
    if (shouldThrottleNotification(row.created_at as string)) {
      throttled.add(row.user_id as string);
    }
  }

  return throttled;
}
