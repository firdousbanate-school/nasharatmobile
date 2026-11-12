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
import { removeSingleAttachmentFile } from "./removeSingleAttachmentFile";

export async function deleteMaintenanceAttachmentAction(
  attachmentId: string,
  requestId: string,
): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.is_active || !profile.school_id) {
      throw new AuthenticationError("Active school session required");
    }

    const supabase = await createSupabaseServerClient();
    const { data: ticket } = await supabase
      .from("maintenance_requests")
      .select("id, reporter_id")
      .eq("id", requestId)
      .eq("school_id", profile.school_id)
      .maybeSingle();

    if (!ticket) throw new NotFoundError("Maintenance ticket not found");

    const allowed = await assertCanManageMaintenanceTicket(profile, ticket.reporter_id);
    if (!allowed) throw new ForbiddenError("Unauthorized to delete this attachment");

    const { data: attachment, error: readError } = await supabase
      .from("maintenance_attachments")
      .select("path")
      .eq("id", attachmentId)
      .eq("request_id", requestId)
      .maybeSingle();

    if (readError) throw mapDatabaseError(readError);
    if (!attachment) throw new NotFoundError("Attachment not found");

    await removeSingleAttachmentFile("maintenance-photos", attachment.path, profile);

    const { error: deleteError } = await supabase
      .from("maintenance_attachments")
      .delete()
      .eq("id", attachmentId)
      .eq("request_id", requestId);

    if (deleteError) throw mapDatabaseError(deleteError);

    revalidatePath(`/[locale]/maintenance/${requestId}`, "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
