"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase";
import { assertCanManageCalendar } from "@/lib/calendar/assertCanManageCalendar";
import { notifyCalendarEventPublished } from "@/lib/calendar/notifyCalendarEventPublished";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import { NotFoundError } from "@/lib/errors/NotFoundError";

export async function publishCalendarEventAction(eventId: string): Promise<ActionResult> {
  try {
    const auth = await assertCanManageCalendar();
    const supabase = await createSupabaseServerClient();
    const { data: updated, error } = await supabase
      .from("calendar_events")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .eq("school_id", auth.schoolId)
      .select("id, title_ar, title_en");

    if (error) {
      throw mapDatabaseError(error);
    }
    // A scoped update that matches no row (unknown id, or another school) must not report success.
    if (!updated || updated.length === 0) {
      throw new NotFoundError("Event not found");
    }

    const publishedRow = updated[0] as {
      id: string;
      title_ar?: string | null;
      title_en?: string | null;
    };

    await notifyCalendarEventPublished({
      eventId,
      schoolId: auth.schoolId,
      publisherId: auth.profileId,
      title: publishedRow.title_ar || publishedRow.title_en || null,
    });

    revalidatePath("/[locale]/calendar", "page");
    revalidatePath(`/[locale]/calendar/${eventId}`, "page");
    revalidatePath("/[locale]", "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
