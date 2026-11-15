import type { SupabaseClient } from "@supabase/supabase-js";
import { getSchoolPermissionHolderIds } from "@/lib/maintenance/getSchoolPermissionHolderIds";
import { logError } from "@/lib/logger/logError";

export async function fetchCircularResponseContext(
  admin: SupabaseClient,
  params: { circularId: string; schoolId: string; departmentId: string; actorUserId: string },
) {
  const { circularId, schoolId, departmentId, actorUserId } = params;
  const [circularRes, departmentRes, publisherIds] = await Promise.all([
    admin
      .from("circulars")
      .select("created_by, ref_number, title")
      .eq("id", circularId)
      .eq("school_id", schoolId)
      .maybeSingle(),
    admin
      .from("departments")
      .select("name")
      .eq("id", departmentId)
      .eq("school_id", schoolId)
      .maybeSingle(),
    getSchoolPermissionHolderIds(schoolId, "circular.publish"),
  ]);

  const lookupError = circularRes.error ?? departmentRes.error;
  if (lookupError) {
    logError(lookupError, { scope: "notifyCircularResponseSubmitted", circularId, schoolId });
  }

  const recipientUserIds = Array.from(
    new Set(
      [circularRes.data?.created_by as string | undefined, ...publisherIds].filter(
        (id): id is string => Boolean(id),
      ),
    ),
  ).filter((id) => id !== actorUserId);

  return {
    circular: circularRes.data,
    department: departmentRes.data,
    recipientUserIds,
  };
}
