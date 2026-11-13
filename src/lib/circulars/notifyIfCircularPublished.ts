import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyDepartmentHeadsOfPublish } from "./notifyDepartmentHeadsOfPublish";

/** Notifies department heads only when a circular transitions into published status. */
export async function notifyIfCircularPublished(
  supabase: SupabaseClient,
  params: {
    circularId: string;
    schoolId: string;
    publisherId: string;
    nextStatus?: string;
    previousStatus: string | null;
  },
): Promise<void> {
  if (params.nextStatus === "published" && params.previousStatus !== "published") {
    await notifyDepartmentHeadsOfPublish(supabase, {
      circularId: params.circularId,
      schoolId: params.schoolId,
      publisherId: params.publisherId,
    });
  }
}
