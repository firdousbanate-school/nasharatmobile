import { createSupabaseServerClient } from "@/lib/supabase";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { applyNotificationFilter } from "./applyNotificationFilter";
import type { NotificationFilter } from "./filterNotifications";
import type { NotificationRow } from "./types";

export async function getUserNotifications(
  limit = 20,
  offset = 0,
  filter: NotificationFilter = "all",
): Promise<NotificationRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data: userRes, error: userError } = await supabase.auth.getUser();
  if (userError || !userRes?.user) return [];

  const base = supabase
    .from("notifications")
    .select(
      "id, user_id, school_id, type, title, body, entity_type, entity_id, read_at, created_at",
    )
    .eq("user_id", userRes.user.id);

  const { data, error } = await applyNotificationFilter(base, filter)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw mapDatabaseError(error);
  return (data as NotificationRow[]) ?? [];
}
