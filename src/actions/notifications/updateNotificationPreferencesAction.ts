"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import type { NotificationPreferences } from "@/lib/notifications/getNotificationPreferences";

const prefsSchema = z.object({
  circular_in_app: z.boolean(),
  circular_push: z.boolean(),
  maintenance_in_app: z.boolean(),
  maintenance_push: z.boolean(),
  calendar_in_app: z.boolean(),
  calendar_push: z.boolean(),
});

export async function updateNotificationPreferencesAction(
  prefs: NotificationPreferences,
): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile?.id || !profile.school_id) {
      throw new AuthenticationError("Unauthorized");
    }

    const parsed = prefsSchema.safeParse(prefs);
    if (!parsed.success) {
      throw new ValidationError("Invalid notification preferences");
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("notification_preferences").upsert(
      {
        user_id: profile.id,
        school_id: profile.school_id,
        ...parsed.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      throw mapDatabaseError(error);
    }

    revalidatePath("/[locale]/notifications", "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
