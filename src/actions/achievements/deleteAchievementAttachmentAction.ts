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
    const { data: attachment, error: readError } = await supabase
      .from("achievement_attachments")
      .select("path")
      .eq("id", attachmentId)
      .eq("achievement_id", achievementId)
      .maybeSingle();

    if (readError) throw mapDatabaseError(readError);
    if (!attachment) throw new NotFoundError("Attachment not found");

    const admin = createSupabaseAdminClient({
      actorId: profile.id,
      actorLabel: profile.full_name,
    });
    await admin.storage.from("achievement-attachments").remove([attachment.path]);

    const { error: deleteError } = await supabase
      .from("achievement_attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("achievement_id", achievementId);

    if (deleteError) throw mapDatabaseError(deleteError);

    revalidatePath("/[locale]/achievements", "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
