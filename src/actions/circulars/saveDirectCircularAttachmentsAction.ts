"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { assertCanManageCirculars } from "@/lib/circulars/assertCanManageCirculars";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";

export interface DirectCircularAttachmentInput {
  path: string;
  mime: string;
  sizeBytes: number;
}

export async function saveDirectCircularAttachmentsAction(params: {
  circularId: string;
  attachments: DirectCircularAttachmentInput[];
}): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.is_active || !profile.school_id) {
      throw new AuthenticationError("Active school session required");
    }

    const auth = await assertCanManageCirculars();
    if (!auth.authorized) {
      throw new ForbiddenError(auth.error || "Unauthorized");
    }

    if (!params.attachments || params.attachments.length === 0) {
      return { success: true };
    }

    const supabase = await createSupabaseServerClient();
    const rows = params.attachments.map((att) => ({
      circular_id: params.circularId,
      school_id: profile.school_id,
      path: att.path,
      mime: att.mime,
      size_bytes: att.sizeBytes,
      uploaded_by: profile.id,
    }));

    const { error } = await supabase.from("circular_attachments").insert(rows);
    if (error) throw mapDatabaseError(error);

    revalidatePath(`/[locale]/circulars/${params.circularId}`, "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
