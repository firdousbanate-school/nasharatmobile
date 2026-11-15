import { dispatchModuleNotification } from "@/lib/notifications/dispatchModuleNotification";
import { getSchoolPermissionHolderIds } from "./getSchoolPermissionHolderIds";

const MANAGER_RELEVANT_STATUSES = new Set(["resolved", "waiting_for_parts", "reopened"]);

export async function notifyMaintenanceStatusUpdated(params: {
  requestId: string;
  schoolId: string;
  actorId: string;
  reporterId: string;
  assignedOperatorId: string | null;
  targetStatus: string;
  title?: string | null;
}): Promise<void> {
  const { requestId, schoolId, actorId, reporterId, assignedOperatorId, targetStatus, title } =
    params;

  const managerIds = MANAGER_RELEVANT_STATUSES.has(targetStatus)
    ? await getSchoolPermissionHolderIds(schoolId, "maintenance.close")
    : [];

  const recipientUserIds = Array.from(
    new Set(
      [reporterId, assignedOperatorId, ...managerIds].filter((id): id is string => Boolean(id)),
    ),
  ).filter((id) => id !== actorId);

  if (recipientUserIds.length === 0) {
    return;
  }

  const body = JSON.stringify({
    status: targetStatus,
    ...(title ? { title } : {}),
  });

  await dispatchModuleNotification({
    recipientUserIds,
    schoolId,
    type: "maintenance",
    title: "maintenance_status_updated",
    body,
    entityType: "maintenance_request",
    entityId: requestId,
    skipThrottle: true,
  });
}
