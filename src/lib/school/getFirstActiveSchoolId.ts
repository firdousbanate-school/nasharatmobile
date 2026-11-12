import { createSupabaseServerClient } from "@/lib/supabase";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";

/**
 * Resolves the fallback tenant for a platform owner.
 *
 * A platform owner has no `school_id` of their own, but the owner manual
 * requires them to create the first school administrator. The old code did this
 * resolution inside `getSchoolUsers` with the service-role client, where it was
 * reachable by any caller with a null school id. It now lives here, is called
 * only after `isPlatformOwner()` returned true, and uses the session client so
 * the database still enforces the read.
 */
export async function getFirstActiveSchoolId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("schools")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw mapDatabaseError(error);
  }

  return data?.id ?? null;
}
