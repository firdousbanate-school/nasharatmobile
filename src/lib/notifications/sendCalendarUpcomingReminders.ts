import type { SupabaseClient } from "@supabase/supabase-js";
import { dispatchModuleNotification } from "./dispatchModuleNotification";

export async function sendCalendarUpcomingReminders(adminClient: SupabaseClient): Promise<number> {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: events } = await adminClient
    .from("calendar_events")
    .select("id, school_id, title_ar, title_en")
    .eq("status", "published")
    .gt("starts_at", now.toISOString())
    .lte("starts_at", next24h.toISOString());

  let totalSent = 0;

  for (const event of events ?? []) {
    const schoolId = event.school_id as string;
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id")
      .eq("school_id", schoolId)
      .eq("is_active", true);

    const recipientUserIds = (profiles ?? []).map((p) => p.id as string).filter(Boolean);
    if (recipientUserIds.length === 0) continue;

    const title =
      (event.title_ar as string | null) || (event.title_en as string | null) || "Calendar Event";

    const { delivered } = await dispatchModuleNotification({
      recipientUserIds,
      schoolId,
      type: "calendar",
      title: "calendar_published",
      body: JSON.stringify({ title }),
      entityType: "calendar_event",
      entityId: event.id as string,
      skipThrottle: false,
    });

    totalSent += delivered;
  }

  return totalSent;
}
