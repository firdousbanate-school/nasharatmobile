import { createSupabaseServerClient } from "@/lib/supabase";
import { warnOnDataTruncation } from "@/lib/supabase/warnOnDataTruncation";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import type { CircularRow } from "./types";

const SELECT_WITH_VISIBILITY = `
  id, school_id, ref_number, title, body, category, priority, status, visibility,
  response_type, response_instructions, allow_response_revision,
  publish_at, due_at, created_by, closed_at, created_at,
  targets:circular_targets(
    id, department_id, role_key,
    departments(id, name_ar, name_en)
  ),
  attachments:circular_attachments(
    id, circular_id, school_id, path, mime, size_bytes, uploaded_by, created_at
  )
`;

const SELECT_WITHOUT_VISIBILITY = `
  id, school_id, ref_number, title, body, category, priority, status,
  response_type, response_instructions, allow_response_revision,
  publish_at, due_at, created_by, closed_at, created_at,
  targets:circular_targets(
    id, department_id, role_key,
    departments(id, name_ar, name_en)
  ),
  attachments:circular_attachments(
    id, circular_id, school_id, path, mime, size_bytes, uploaded_by, created_at
  )
`;

export async function getSchoolCirculars(schoolId?: string | null): Promise<CircularRow[]> {
  if (!schoolId) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("circulars")
    .select(SELECT_WITH_VISIBILITY)
    .eq("school_id", schoolId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42703" || error.message?.includes("visibility")) {
      const fallback = await supabase
        .from("circulars")
        .select(SELECT_WITHOUT_VISIBILITY)
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      if (fallback.error) {
        throw mapDatabaseError(fallback.error);
      }

      const mapped = (fallback.data as unknown as CircularRow[]).map((row) => ({
        ...row,
        visibility: row.visibility ?? "internal",
      }));
      warnOnDataTruncation(mapped.length, "getSchoolCirculars.fallback");
      return mapped;
    }

    throw mapDatabaseError(error);
  }

  const result = (data as unknown as CircularRow[]) ?? [];
  warnOnDataTruncation(result.length, "getSchoolCirculars");
  return result;
}
