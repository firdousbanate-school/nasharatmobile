"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";

export interface MaintenanceAttachmentInput {
  path: string;
  mime: string;
  sizeBytes: number;
}

export async function saveMaintenanceAttachmentsAction(params: {
  requestId: string;
  kind: "report" | "evidence";
  attachments: MaintenanceAttachmentInput[];
}): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.is_active || !profile.school_id) {
      throw new AuthenticationError("Active school session required");
    }

    if (!params.attachments || params.attachments.length === 0) {
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();
    const rows = params.attachments.map((att) => ({
      request_id: params.requestId,
      school_id: profile.school_id,
      kind: params.kind,
      path: att.path,
      mime: att.mime,
      size_bytes: att.sizeBytes,
      uploaded_by: profile.id,
    }));

    const { error } = await supabase.from("maintenance_attachments").insert(rows);
    if (error) throw mapDatabaseError(error);

    revalidatePath(`/[locale]/maintenance/${params.requestId}`, "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
