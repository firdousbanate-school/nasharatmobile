import { createSupabaseAdminClient } from "@/lib/supabase";
import { dispatchModuleNotification } from "@/lib/notifications/dispatchModuleNotification";
import { logError } from "@/lib/logger/logError";
import { buildCircularResponseNotificationBody } from "./buildCircularResponseNotificationBody";
import { fetchCircularResponseContext } from "./fetchCircularResponseContext";
import { updateExistingResponseNotifications } from "./updateExistingResponseNotifications";

export async function notifyCircularResponseSubmitted(params: {
  circularId: string;
  schoolId: string;
  departmentId: string;
  actorUserId: string;
  status: string;
}): Promise<void> {
  const { circularId, schoolId, departmentId, actorUserId, status } = params;

  try {
    const admin = createSupabaseAdminClient();
    const { circular, department, recipientUserIds } = await fetchCircularResponseContext(admin, {
      circularId,
      schoolId,
      departmentId,
      actorUserId,
    });

    if (recipientUserIds.length === 0) return;

    const remainingUserIds = await updateExistingResponseNotifications(admin, {
      recipientUserIds,
      circularId,
      ref: (circular?.ref_number as string | undefined) ?? "",
      title: (circular?.title as string | undefined) ?? "",
      department: (department?.name as string | undefined) ?? "",
      status,
    });

    if (remainingUserIds.length === 0) return;

    await dispatchModuleNotification({
      recipientUserIds: remainingUserIds,
      schoolId,
      type: "circular",
      title: "circular_response_submitted",
      body: buildCircularResponseNotificationBody(circular, department, status),
      entityType: "circular",
      entityId: circularId,
      skipThrottle: true,
    });
  } catch (error) {
    logError(error, { scope: "notifyCircularResponseSubmitted", circularId, schoolId });
  }
}
