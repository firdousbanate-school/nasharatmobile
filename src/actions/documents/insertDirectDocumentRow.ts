import type { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "@/lib/errors/ValidationError";
import type { SchoolDocumentSlug } from "@/lib/documents/types";

export interface InsertDirectDocumentRowParams {
  admin: SupabaseClient;
  schoolId: string;
  slug: SchoolDocumentSlug;
  title: string;
  description?: string | null;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  profileId?: string | null;
}

export async function insertDirectDocumentRow({
  admin,
  schoolId,
  slug,
  title,
  description,
  filePath,
  fileName,
  fileSize,
  mimeType,
  profileId,
}: InsertDirectDocumentRowParams): Promise<string> {
  const { data: inserted, error: insertError } = await admin
    .from("school_documents")
    .insert({
      school_id: schoolId,
      slug,
      title,
      description: description?.trim() || null,
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      mime_type: mimeType,
      created_by: profileId ?? null,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    throw new ValidationError(insertError?.message || "Failed to register document");
  }

  return inserted.id;
}
