import { createSupabaseServerClient } from "@/lib/supabase";
import type { SchoolDocumentRow } from "./types";

export async function getPublicSchoolDocuments(
  schoolId?: string | null,
): Promise<SchoolDocumentRow[]> {
  if (!schoolId) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("school_documents")
    .select(
      `
      id,
      school_id,
      slug,
      title,
      description,
      file_path,
      file_name,
      file_size,
      mime_type,
      is_published,
      created_by,
      created_at,
      updated_at
    `,
    )
    .eq("school_id", schoolId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  let rows: Record<string, unknown>[] | null = data;
  if (error && error.code === "42703") {
    const fallback = await supabase
      .from("school_documents")
      .select(
        `
        id,
        school_id,
        slug,
        title,
        description,
        file_path,
        file_name,
        file_size,
        mime_type,
        created_by,
        created_at,
        updated_at
      `,
      )
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });
    rows = fallback.data;
  }

  if (!rows) return [];

  return rows.map((doc) => ({
    ...doc,
    is_published: typeof doc.is_published === "boolean" ? doc.is_published : true,
    file_url: `/api/documents/${doc.id as string}/preview`,
  })) as unknown as SchoolDocumentRow[];
}
