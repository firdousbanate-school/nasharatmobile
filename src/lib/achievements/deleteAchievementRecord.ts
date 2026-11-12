import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteAchievementRecord(
  supabase: SupabaseClient,
  achievementId: string,
  schoolId: string,
) {
  // 1. Fetch achievement to get image_path
  const { data: ach } = await supabase
    .from("school_achievements")
    .select("image_path")
    .eq("id", achievementId)
    .eq("school_id", schoolId)
    .maybeSingle();

  if (ach?.image_path) {
    await supabase.storage.from("public-assets").remove([ach.image_path]);
  }

  // 2. Fetch all multi-file attachments to delete from storage
  const { data: attachments } = await supabase
    .from("achievement_attachments")
    .select("path")
    .eq("achievement_id", achievementId);

  if (attachments && attachments.length > 0) {
    await supabase.storage.from("achievement-attachments").remove(attachments.map((a) => a.path));
  }

  // 3. Delete row (cascades to achievement_attachments)
  const { data: deleted, error } = await supabase
    .from("school_achievements")
    .delete()
    .eq("id", achievementId)
    .eq("school_id", schoolId)
    .select("id");

  if (error) {
    return { error: error.message };
  }

  if (!deleted || deleted.length === 0) {
    return { error: "Achievement not found" };
  }

  return { success: true };
}
