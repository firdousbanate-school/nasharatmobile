import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Makes the role's permissions equal to `permissionKeys` WITHOUT ever leaving the role empty:
 * missing permissions are added first and removed ones are deleted afterwards, so a failed
 * insert (for example an unknown permission key) changes nothing. A failed delete leaves the
 * role with the old and new permissions; the caller is told and can safely retry (idempotent).
 */
export async function syncRolePermissions(
  supabase: SupabaseClient,
  roleId: string,
  permissionKeys: string[],
): Promise<void> {
  const { data: existing, error: readError } = await supabase
    .from("role_permissions")
    .select("permission_key")
    .eq("role_id", roleId);
  if (readError) {
    throw readError;
  }

  const current = new Set((existing ?? []).map((row) => row.permission_key as string));
  const wanted = new Set(permissionKeys);
  const toAdd = [...wanted].filter((key) => !current.has(key));
  const toRemove = [...current].filter((key) => !wanted.has(key));

  if (toAdd.length > 0) {
    const rows = toAdd.map((key) => ({ role_id: roleId, permission_key: key }));
    const { error: insertError } = await supabase.from("role_permissions").insert(rows);
    if (insertError) {
      throw insertError;
    }
  }

  if (toRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId)
      .in("permission_key", toRemove);
    if (deleteError) {
      throw deleteError;
    }
  }
}
