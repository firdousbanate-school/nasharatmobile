import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase";
import { logError } from "@/lib/logger";
import type { CircularRow } from "./types";

const PUBLIC_CIRCULAR_DETAIL_SELECT =
  "id, school_id, ref_number, title, body, category, priority, status, visibility, response_type, publish_at, due_at, created_at";

/**
 * Fetches one circular for the public portal.
 *
 * Only a published, public circular is returned. A circular that is not
 * published, not public, or that belongs to a school which is not active
 * resolves to null.
 */
export async function getPublicCircularById(circularId: string): Promise<CircularRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("circulars")
    .select(PUBLIC_CIRCULAR_DETAIL_SELECT)
    .eq("id", circularId)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();

  if (error) {
    logError(error, { scope: "getPublicCircularById", circularId });
  }

  if (data) {
    return data as unknown as CircularRow;
  }

  const admin = createSupabaseAdminClient();
  const adminRes = await admin
    .from("circulars")
    .select(PUBLIC_CIRCULAR_DETAIL_SELECT)
    .eq("id", circularId)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();

  if (adminRes.error) {
    logError(adminRes.error, { scope: "getPublicCircularByIdAdmin", circularId });
    return null;
  }

  return (adminRes.data as unknown as CircularRow) ?? null;
}
