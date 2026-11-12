import type { SupabaseClient } from "@supabase/supabase-js";
import type { CircularPriority, CircularResponseType, CircularVisibility } from "./types";

export async function createCircularRecord(
  supabase: SupabaseClient,
  params: {
    schoolId: string;
    title: string;
    body: string;
    priority: CircularPriority;
    visibility?: CircularVisibility;
    responseType: CircularResponseType;
    dueAt: string | null;
    createdBy: string;
  },
): Promise<{ circularId?: string; error?: string }> {
  // 0023 revoked the raw generator from `authenticated`; end users go through
  // the checked wrapper (audit finding B-4).
  const { data: refNum, error: refError } = await supabase.rpc("next_school_number", {
    p_school: params.schoolId,
    p_kind: "circular",
  });

  if (refError) return { error: refError.message };
  if (!refNum) return { error: "Failed to generate reference number" };

  let { data, error } = await supabase
    .from("circulars")
    .insert({
      school_id: params.schoolId,
      ref_number: refNum,
      title: params.title,
      body: params.body,
      priority: params.priority,
      visibility: params.visibility ?? "internal",
      status: "draft",
      response_type: params.responseType,
      due_at: params.dueAt,
      created_by: params.createdBy,
    })
    .select("id")
    .single();

  if (error && (error.code === "42703" || error.message?.includes("visibility"))) {
    const fallback = await supabase
      .from("circulars")
      .insert({
        school_id: params.schoolId,
        ref_number: refNum,
        title: params.title,
        body: params.body,
        priority: params.priority,
        status: "draft",
        response_type: params.responseType,
        due_at: params.dueAt,
        created_by: params.createdBy,
      })
      .select("id")
      .single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) return { error: error.message };
  if (!data) return { error: "Failed to create circular" };

  return { circularId: data.id };
}
