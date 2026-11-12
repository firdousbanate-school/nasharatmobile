import type { SupabaseClient } from "@supabase/supabase-js";
import type { MaintenancePriority } from "./types";

export async function createMaintenanceRecord(
  supabase: SupabaseClient,
  params: {
    schoolId: string;
    title: string;
    description: string;
    category: string;
    locationId: string | null;
    area: string | null;
    assetRef: string | null;
    priority: MaintenancePriority;
    reporterId: string;
    reporterDepartmentId: string | null;
  },
): Promise<{ requestId?: string; error?: string }> {
  // 0023 revoked the raw generator from `authenticated`; end users go through
  // the checked wrapper (audit finding B-4).
  const { data: ticketNumber, error: ticketError } = await supabase.rpc("next_school_number", {
    p_school: params.schoolId,
    p_kind: "maintenance",
  });

  if (ticketError) return { error: ticketError.message };
  if (!ticketNumber) return { error: "Failed to generate ticket number" };

  const { data, error } = await supabase
    .from("maintenance_requests")
    .insert({
      school_id: params.schoolId,
      ticket_number: ticketNumber,
      title: params.title,
      description: params.description,
      category: params.category,
      location_id: params.locationId,
      area: params.area,
      asset_ref: params.assetRef,
      priority: params.priority,
      status: "submitted",
      reporter_id: params.reporterId,
      reporter_department_id: params.reporterDepartmentId,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  if (!data) return { error: "Failed to create maintenance request" };

  return { requestId: data.id };
}
