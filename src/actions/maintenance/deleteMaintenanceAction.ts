"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { assertCanManageMaintenanceTicket } from "@/lib/maintenance/assertCanManageMaintenanceTicket";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { NotFoundError } from "@/lib/errors/NotFoundError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import { removeMaintenanceStorageFiles } from "./removeMaintenanceStorageFiles";

export async function deleteMaintenanceAction(requestId: string): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.is_active || !profile.school_id) {
      throw new AuthenticationError("Active school session required");
    }

    const supabase = await createSupabaseServerClient();
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
      throw new ForbiddenError("Unauthorized to delete this maintenance ticket");
    }

    await removeMaintenanceStorageFiles(supabase, requestId, profile);

    const { error: deleteError } = await supabase
      .from("maintenance_requests")
      .delete()
      .eq("id", requestId)
      .eq("school_id", profile.school_id);

    if (deleteError) throw mapDatabaseError(deleteError);

    revalidatePath("/[locale]/maintenance", "page");
    revalidatePath("/[locale]/dashboard", "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
