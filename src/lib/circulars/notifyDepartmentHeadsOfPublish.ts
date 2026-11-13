import type { SupabaseClient } from "@supabase/supabase-js";
import { dispatchModuleNotification } from "@/lib/notifications/dispatchModuleNotification";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";

type TargetHead = { department: { head_profile_id: string | null } | null };

/**
 * Notifies the heads of the departments a circular targets (never the publisher).
 * Notification delivery is fire-and-forget; only the targets lookup can throw.
 */
export async function notifyDepartmentHeadsOfPublish(
  supabase: SupabaseClient,
  params: { circularId: string; schoolId: string; publisherId: string },
): Promise<void> {
  const { circularId, schoolId, publisherId } = params;

  const { data: targets, error } = await supabase
    .from("circular_targets")
    .select("department:departments(head_profile_id)")
    .eq("circular_id", circularId);

  if (error) {
    throw mapDatabaseError(error);
  }

  const headIds = ((targets ?? []) as unknown as TargetHead[])
    .map((t) => t.department?.head_profile_id)
    .filter((id): id is string => Boolean(id) && id !== publisherId);

  if (headIds.length > 0) {
    await dispatchModuleNotification({
      recipientUserIds: headIds,
      schoolId,
      type: "circular",
      title: "circular_published",
      body: "circular_published",
      entityType: "circular",
      entityId: circularId,
    });
  }
}
