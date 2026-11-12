"use server";

import { revalidateSettingsPath } from "@/lib/settings/revalidateSettingsPath";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { hasPermission } from "@/lib/rbac/hasPermission";
import { parseLocationInput } from "@/lib/school/parseLocationInput";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { ForbiddenError } from "@/lib/errors/ForbiddenError";
import { ValidationError } from "@/lib/errors/ValidationError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import { NotFoundError } from "@/lib/errors/NotFoundError";

export async function updateLocationAction(
  locationId: string,
  building: string,
  floor: string | null,
  room: string | null,
  kind: string,
): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile?.school_id) {
      throw new AuthenticationError("No school associated with profile");
    }

    const allowed = await hasPermission("settings.school.update", profile.school_id);
    if (!allowed) {
      throw new ForbiddenError("Unauthorized");
    }

    const payload = parseLocationInput(building, floor, room, kind);
    if (!payload.building) {
      throw new ValidationError("Building is required");
    }

    const supabase = await createSupabaseServerClient();
    const { data: updated, error } = await supabase
      .from("locations")
      .update(payload)
      .eq("id", locationId)
      .eq("school_id", profile.school_id)
      .select("id");

    if (error) {
      throw mapDatabaseError(error);
    }

    // A scoped update that matches no row (unknown id, or another school) must not report success.
    if (!updated || updated.length === 0) {
      throw new NotFoundError("Location not found");
    }

    revalidateSettingsPath("locations");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
