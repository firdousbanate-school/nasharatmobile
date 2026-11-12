"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { hasPermission } from "@/lib/rbac/hasPermission";
import { notifyDepartmentHeadsOfPublish } from "@/lib/circulars/notifyDepartmentHeadsOfPublish";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import { NotFoundError } from "@/lib/errors/NotFoundError";

export async function publishCircularAction(circularId: string): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile?.school_id) {
      throw new AuthenticationError("No school associated with profile");
    }

    const allowed = await hasPermission("circular.publish", profile.school_id);
    if (!allowed) {
      throw new ForbiddenError("Unauthorized");
    }

    const supabase = await createSupabaseServerClient();
    const { data: updated, error } = await supabase
      .from("circulars")
      .update({
        status: "published",
        publish_at: new Date().toISOString(),
      })
      .eq("id", circularId)
      .eq("school_id", profile.school_id)
      .select("id");

    if (error) {
      throw mapDatabaseError(error);
    }
    // A scoped update that matches no row (unknown id, or another school) must not report success.
    if (!updated || updated.length === 0) {
      throw new NotFoundError("Circular not found");
    }

    await notifyDepartmentHeadsOfPublish(supabase, {
      circularId,
      schoolId: profile.school_id,
      publisherId: profile.id,
    });

    revalidatePath("/[locale]/circulars", "page");
    revalidatePath(`/[locale]/circulars/${circularId}`, "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
