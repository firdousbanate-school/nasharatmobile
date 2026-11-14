"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase";
import { createSupabaseAdminClient } from "@/lib/supabase/createSupabaseAdminClient";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";

export async function deleteAchievementAttachmentAction(
  attachmentId: string,
  achievementId: string,
): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.is_active || !profile.school_id) {
      throw new AuthenticationError("Active school session required");
    }

    const supabase = await createSupabaseServerClient();
    // Delete the database row under user RLS first so unauthorized callers
    // cannot delete storage objects before RLS rejects the DB mutation.
    const { data: deleted, error: deleteError } = await supabase
      .from("achievement_attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("achievement_id", achievementId)
      .select("id, path")
      .maybeSingle();

    if (deleteError) throw mapDatabaseError(deleteError);
    if (!deleted) throw new NotFoundError("Attachment not found");

    const admin = createSupabaseAdminClient({
      actorId: profile.id,
      actorLabel: profile.full_name,
    });
    await admin.storage.from("achievement-attachments").remove([deleted.path]);

    revalidatePath("/[locale]/achievements", "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
