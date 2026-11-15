import { createSupabaseServerClient } from "@/lib/supabase";
import { logError } from "@/lib/logger/logError";
import type { NotificationEntityKind } from "./types";

export async function markEntityNotificationsRead(
  entityType: NotificationEntityKind,
  entityId: string,
): Promise<void> {
  if (!entityId) return;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userRes, error: userError } = await supabase.auth.getUser();
    if (userError || !userRes?.user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userRes.user.id)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .is("read_at", null);

    if (error) {
      logError(error, { scope: "markEntityNotificationsRead", entityType, entityId });
    }
  } catch (error) {
    logError(error, { scope: "markEntityNotificationsRead", entityType, entityId });
  }
}
