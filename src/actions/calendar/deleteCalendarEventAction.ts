"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import { assertCanDeleteCalendarEvent } from "./assertCanDeleteCalendarEvent";

export async function deleteCalendarEventAction(eventId: string): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.is_active || !profile.school_id) {
      throw new AuthenticationError("Active school session required");
    }

    await assertCanDeleteCalendarEvent(profile.id, profile.school_id);

    const supabase = await createSupabaseServerClient();
    const { data: event, error: readError } = await supabase
      .from("calendar_events")
      .select("id, image_path")
      .eq("id", eventId)
      .eq("school_id", profile.school_id)
      .maybeSingle();

    if (readError) throw mapDatabaseError(readError);
    if (!event) throw new NotFoundError("Calendar event not found");

    if (event.image_path) {
      await supabase.storage.from("public-assets").remove([event.image_path]);
    }

    const { error: deleteError } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", eventId)
      .eq("school_id", profile.school_id);

    if (deleteError) throw mapDatabaseError(deleteError);

    revalidatePath("/[locale]/calendar", "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
