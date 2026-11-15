import type { SupabaseClient } from "@supabase/supabase-js";
import { dispatchModuleNotification } from "@/lib/notifications/dispatchModuleNotification";
import { mapDatabaseError } from "@/lib/errors/mapDatabaseError";
import { buildCircularPublishBody } from "./buildCircularPublishBody";
import { extractCircularTargetInfo, type CircularTargetRow } from "./extractCircularTargetInfo";
import { getDepartmentMemberUserIds } from "./getDepartmentMemberUserIds";
import { resolveCircularExtraRecipientIds } from "./resolveCircularExtraRecipientIds";

/**
 * Notifies the heads and active members of the departments a circular targets
 * (or all active school members when the circular targets all departments),
 * excluding the publisher, and includes the circular's reference number and title.
 */
export async function notifyDepartmentHeadsOfPublish(
  supabase: SupabaseClient,
  params: {
    circularId: string;
    schoolId: string;
    publisherId: string;
    circularRef?: string | null;
    circularTitle?: string | null;
  },
): Promise<void> {
  const { circularId, schoolId, publisherId } = params;

  const { data: targets, error } = await supabase
    .from("circular_targets")
    .select(
      "department_id, department:departments(head_profile_id), circular:circulars(ref_number, title)",
    )
    .eq("circular_id", circularId);

  if (error) {
    throw mapDatabaseError(error);
  }

  const { headIds, departmentIds, ref, title } = extractCircularTargetInfo(
    (targets ?? []) as unknown as CircularTargetRow[],
  );

  const [memberIds, extraIds] = await Promise.all([
    departmentIds.length > 0 ? getDepartmentMemberUserIds(supabase, schoolId, departmentIds) : [],
    resolveCircularExtraRecipientIds(schoolId, departmentIds),
  ]);

  const recipientIds = Array.from(new Set([...headIds, ...memberIds, ...extraIds])).filter(
    (id) => id !== publisherId,
  );

  if (recipientIds.length === 0) {
    return;
  }

  await dispatchModuleNotification({
    recipientUserIds: recipientIds,
    schoolId,
    type: "circular",
    title: "circular_published",
    body: buildCircularPublishBody(params.circularRef ?? ref, params.circularTitle ?? title),
    entityType: "circular",
    entityId: circularId,
  });
}
