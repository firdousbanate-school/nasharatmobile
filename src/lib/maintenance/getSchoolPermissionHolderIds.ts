import { createSupabaseAdminClient } from "@/lib/supabase";
import { logError } from "@/lib/logger/logError";

/**
 * Resolves user IDs in `schoolId` whose assigned role grants `permissionKey`.
 * Uses the admin client because regular callers (e.g. staff reporting a ticket)
 * cannot read other users' rows in `user_role_assignments` under RLS.
 */
export async function getSchoolPermissionHolderIds(
  schoolId: string,
  permissionKey: string,
): Promise<string[]> {
  if (!schoolId || !permissionKey) return [];

  try {
    const admin = createSupabaseAdminClient();
    const { data: rolePerms, error: permError } = await admin
      .from("role_permissions")
      .select("role_id")
      .eq("permission_key", permissionKey);

    if (permError || !rolePerms?.length) {
      if (permError) {
        logError(permError, { scope: "getSchoolPermissionHolderIds", schoolId, permissionKey });
      }
      return [];
    }

    const roleIds = rolePerms.map((rp) => rp.role_id as string);
    const { data: assignments, error: assignError } = await admin
      .from("user_role_assignments")
      .select("user_id")
      .eq("school_id", schoolId)
      .in("role_id", roleIds);

    if (assignError) {
      logError(assignError, { scope: "getSchoolPermissionHolderIds", schoolId, permissionKey });
      return [];
    }

    return Array.from(new Set((assignments ?? []).map((a) => a.user_id as string).filter(Boolean)));
  } catch (error) {
    logError(error, { scope: "getSchoolPermissionHolderIds", schoolId, permissionKey });
    return [];
  }
}
