import { createSupabaseAdminClient } from "@/lib/supabase";
import { logError } from "@/lib/logger/logError";
import { dispatchModuleNotification } from "@/lib/notifications/dispatchModuleNotification";

export async function notifyCalendarEventPublished(params: {
  eventId: string;
  schoolId: string;
  publisherId?: string | null;
  title?: string | null;
}): Promise<void> {
  const { eventId, schoolId, publisherId, title } = params;
  if (!schoolId || !eventId) return;

  try {
    const admin = createSupabaseAdminClient();
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("id")
      .eq("school_id", schoolId)
      .eq("is_active", true);

    if (error) {
      logError(error, { scope: "notifyCalendarEventPublished", schoolId, eventId });
      return;
    }

    const recipientUserIds = (profiles ?? [])
      .map((p) => p.id as string)
      .filter((id) => Boolean(id) && id !== publisherId);

    if (recipientUserIds.length === 0) {
      return;
    }

    const body = title ? JSON.stringify({ title }) : "calendar_published";

    await dispatchModuleNotification({
      recipientUserIds,
      schoolId,
      type: "calendar",
      title: "calendar_published",
      body,
      entityType: "calendar_event",
      entityId: eventId,
    });
  } catch (error) {
    logError(error, { scope: "notifyCalendarEventPublished", schoolId, eventId });
  }
}
