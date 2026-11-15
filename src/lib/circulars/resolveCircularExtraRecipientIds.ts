import { createSupabaseAdminClient } from "@/lib/supabase";

type RoleAssignmentRow = {
  user_id: string;
  department_id: string | null;
  roles: { key: string } | { key: string }[] | null;
};

/**
 * Resolves additional circular recipients using the admin client so that:
 * 1. Circulars with no explicit target rows ("All Departments") notify all active school members.
 * 2. Department heads whose department is recorded on `user_role_assignments`
 *    (or who hold the `department_head` role without a specific `department_id`) are included.
 */
export async function resolveCircularExtraRecipientIds(
  schoolId: string,
  departmentIds: string[],
): Promise<string[]> {
  try {
    const admin = createSupabaseAdminClient();

    if (departmentIds.length === 0) {
      const { data: allProfiles } = await admin
        .from("profiles")
        .select("id")
        .eq("school_id", schoolId)
        .eq("is_active", true);
      return (allProfiles ?? []).map((p) => p.id as string).filter(Boolean);
    }

    const deptSet = new Set(departmentIds);
    const { data: assignments } = await admin
      .from("user_role_assignments")
      .select("user_id, department_id, roles(key)")
      .eq("school_id", schoolId);

    const rows = (assignments ?? []) as unknown as RoleAssignmentRow[];
    return rows
      .filter((r) => {
        if (r.department_id) return deptSet.has(r.department_id);
        const roleKey = Array.isArray(r.roles) ? r.roles[0]?.key : r.roles?.key;
        return roleKey === "department_head";
      })
      .map((r) => r.user_id);
  } catch {
    return [];
  }
}
