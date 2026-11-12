import { createSupabaseServerClient } from "@/lib/supabase";
import type { SchoolDocumentRow, SchoolDocumentSlug } from "./types";

export async function getSchoolDocumentsBySlug(
  schoolId?: string | null,
  slug?: SchoolDocumentSlug,
): Promise<SchoolDocumentRow[]> {
  if (!schoolId || !slug) return [];

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
      updated_at,
      creator:profiles!created_by(id, full_name)
    `,
    )
    .eq("school_id", schoolId)
    .eq("slug", slug)
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
        updated_at,
        creator:profiles!created_by(id, full_name)
      `,
      )
      .eq("school_id", schoolId)
      .eq("slug", slug)
      .order("created_at", { ascending: false });
    rows = fallback.data;
  }

  if (!rows) return [];

  return rows.map((doc) => ({
    ...doc,
    is_published: typeof doc.is_published === "boolean" ? doc.is_published : true,
    file_url: `/api/documents/${doc.id as string}/preview`,
    creator: Array.isArray(doc.creator) ? (doc.creator[0] ?? null) : (doc.creator ?? null),
  })) as unknown as SchoolDocumentRow[];
}
