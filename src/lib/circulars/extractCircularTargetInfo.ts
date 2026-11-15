export type CircularTargetRow = {
  department_id?: string | null;
  department?: { head_profile_id: string | null } | null;
  circular?: { ref_number?: string | null; title?: string | null } | null;
};

export function extractCircularTargetInfo(rows: CircularTargetRow[]) {
  const headIds = rows
    .map((t) => t.department?.head_profile_id)
    .filter((id): id is string => Boolean(id));
  const departmentIds = Array.from(
    new Set(rows.map((t) => t.department_id).filter((id): id is string => Boolean(id))),
  );
  const firstCircular = rows[0]?.circular;

  return {
    headIds,
    departmentIds,
    ref: firstCircular?.ref_number,
    title: firstCircular?.title,
  };
}
