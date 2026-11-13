import type { SupabaseClient } from "@supabase/supabase-js";

/** Fetches the current status of a circular scoped to its school. */
export async function fetchCircularStatus(
  supabase: SupabaseClient,
  circularId: string,
  schoolId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("circulars")
    .select("status")
    .eq("id", circularId)
    .eq("school_id", schoolId)
    .maybeSingle();

  return (data?.status as string | undefined) ?? null;
}
