import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { isPlatformOwner } from "@/lib/auth/isPlatformOwner";
import { hasPermission } from "@/lib/rbac/hasPermission";

export type ManageUserPermissionResult = {
  allowed: boolean;
  schoolId?: string;
  currentUserId?: string;
  error?: string;
};

/**
 * Authorises a mutation on `targetUserId`.
 *
 * Both sides are checked: the caller must hold `users.manage` in their own
 * school AND the target must belong to that same school. Without the second
 * check a manager could pass a foreign user id to `updateUserAction`, which
 * then rewrote that user's email and password through the service-role client
 * (audit finding C-1).
 */
export async function assertCanManageUser(
  targetUserId: string,
  targetRoleKey?: string | null,
): Promise<ManageUserPermissionResult> {
  const profile = await getCurrentProfile();
  if (!profile?.school_id) {
    return { allowed: false, error: "No school associated with profile" };
  }

  const permitted = await hasPermission("users.manage", profile.school_id);
  if (!permitted) {
    return { allowed: false, error: "Unauthorized" };
  }

  // RLS lets a manager read the profiles of their own school only, so a
  // foreign id resolves to "not found" instead of leaking its existence.
  const supabase = await createSupabaseServerClient();
  const { data: target, error } = await supabase
    .from("profiles")
    .select("id, school_id")
    .eq("id", targetUserId)
    .maybeSingle();

  if (error) {
    return { allowed: false, error: "Failed to load the target user" };
  }

  if (!target || target.school_id !== profile.school_id) {
    return { allowed: false, error: "User not found in this school" };
  }

  if (await isPlatformOwner(targetUserId)) {
    return { allowed: false, error: "Cannot modify system-protected account" };
  }

  if (targetRoleKey === "owner") {
    return { allowed: false, error: "Invalid role selection" };
  }

  return { allowed: true, schoolId: profile.school_id, currentUserId: profile.id };
}
