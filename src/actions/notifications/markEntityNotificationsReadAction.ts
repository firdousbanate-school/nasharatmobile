"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import { isNotificationEntityKind } from "@/lib/notifications/isNotificationEntityKind";
import type { NotificationEntityKind } from "@/lib/notifications/types";

/**
 * Marks the caller's unread notifications for one entity as read. Invoked from
 * the client after a detail page mounts (never during server render), so the
 * header badge can be refreshed and link prefetches cannot mutate read state.
 */
export async function markEntityNotificationsReadAction(
  entityType: NotificationEntityKind,
  entityId: string,
): Promise<ActionResult<{ updated: number }>> {
  try {
    if (!isNotificationEntityKind(entityType) || !entityId) {
      throw new ValidationError("Invalid notification entity");
    }

    const supabase = await createSupabaseServerClient();
    const { data: userRes, error: userError } = await supabase.auth.getUser();
    if (userError || !userRes?.user) {
      throw new AuthenticationError("Unauthorized");
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userRes.user.id)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .is("read_at", null)
      .select("id");

    if (error) {
      throw mapDatabaseError(error);
    }

    const updated = (data ?? []).length;
    if (updated > 0) {
      revalidatePath("/[locale]/notifications", "page");
      revalidatePath("/[locale]", "layout");
    }
    return { success: true, updated };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
