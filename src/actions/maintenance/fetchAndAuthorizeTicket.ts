import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileRow } from "@/lib/auth/getCurrentProfile";
import { assertCanManageMaintenanceTicket } from "@/lib/maintenance/assertCanManageMaintenanceTicket";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";

export async function fetchAndAuthorizeTicket(
  supabase: SupabaseClient,
  requestId: string,
  profile: ProfileRow,
): Promise<{ id: string; reporter_id: string }> {
  const { data: ticket, error: ticketError } = await supabase
    .from("maintenance_requests")
    .select("id, reporter_id")
    .eq("id", requestId)
    .eq("school_id", profile.school_id)
    .maybeSingle();

  if (ticketError) throw mapDatabaseError(ticketError);
  if (!ticket) throw new NotFoundError("Maintenance ticket not found");

  const allowed = await assertCanManageMaintenanceTicket(profile, ticket.reporter_id);
  if (!allowed) {
    throw new ForbiddenError("Unauthorized to update this maintenance ticket");
  }

  return ticket;
}
