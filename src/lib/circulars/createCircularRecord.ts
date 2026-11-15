import type { SupabaseClient } from "@supabase/supabase-js";
import type { CircularPriority, CircularResponseType, CircularVisibility } from "./types";
import { buildCircularInsertPayload } from "./buildCircularInsertPayload";

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
    canPublish?: boolean;
  },
): Promise<{ circularId?: string; refNumber?: string; error?: string }> {
  // 0023 revoked the raw generator from `authenticated`; end users go through
  // the checked wrapper (audit finding B-4).
  const { data: refNum, error: refError } = await supabase.rpc("next_school_number", {
    p_school: params.schoolId,
    p_kind: "circular",
  });

  if (refError) return { error: refError.message };
  if (!refNum) return { error: "Failed to generate reference number" };

  const { basePayload, payloadWithVisibility } = buildCircularInsertPayload({
    ...params,
    refNum: String(refNum),
  });

  let { data, error } = await supabase
    .from("circulars")
    .insert(payloadWithVisibility)
    .select("id")
    .single();

  if (error && (error.code === "42703" || error.message?.includes("visibility"))) {
    const fallback = await supabase.from("circulars").insert(basePayload).select("id").single();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) return { error: error.message };
  if (!data) return { error: "Failed to create circular" };

  return { circularId: data.id, refNumber: String(refNum) };
}
