import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteAchievementRecord(
  supabase: SupabaseClient,
  achievementId: string,
  schoolId: string,
) {
  const { data: deleted, error } = await supabase
    .from("school_achievements")
    .delete()
    .eq("id", achievementId)
    .eq("school_id", schoolId)
    .select("id");

  if (error) {
    return { error: error.message };
  }

  // A scoped delete that matches no row (unknown id, or another school) must not report success.
  if (!deleted || deleted.length === 0) {
    return { error: "Achievement not found" };
  }

  return { success: true };
}
