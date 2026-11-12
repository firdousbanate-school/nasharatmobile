"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { AuthenticationError } from "@/lib/errors/AuthenticationError";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { sanitizeError } from "@/lib/errors/sanitizeError";
import { formatActionErrorResult, type ActionResult } from "@/lib/errors/formatActionErrorResult";
import type { MaintenanceCategory, MaintenancePriority } from "@/lib/maintenance/types";
import { validateMaintenanceUpdateInput } from "./validateMaintenanceUpdateInput";
import { fetchAndAuthorizeTicket } from "./fetchAndAuthorizeTicket";

export interface UpdateMaintenanceInput {
  requestId: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  locationId?: string | null;
  area?: string | null;
}

export async function updateMaintenanceAction(
  input: UpdateMaintenanceInput,
): Promise<ActionResult> {
  try {
    const profile = await getCurrentProfile();
    if (!profile?.is_active || !profile.school_id) {
      throw new AuthenticationError("Active school session required");
    }

    validateMaintenanceUpdateInput(input);

    const supabase = await createSupabaseServerClient();
    await fetchAndAuthorizeTicket(supabase, input.requestId, profile);

    const { error: updateError } = await supabase
      .from("maintenance_requests")
      .update({
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        priority: input.priority,
        location_id: input.locationId ?? null,
        area: input.area?.trim() ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.requestId)
      .eq("school_id", profile.school_id);

    if (updateError) throw mapDatabaseError(updateError);

    revalidatePath("/[locale]/maintenance", "page");
    revalidatePath(`/[locale]/maintenance/${input.requestId}`, "page");
    return { success: true };
  } catch (err: unknown) {
    const appError = sanitizeError(err);
    return formatActionErrorResult(appError);
  }
}
