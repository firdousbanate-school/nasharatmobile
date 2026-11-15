import { dispatchModuleNotification } from "@/lib/notifications/dispatchModuleNotification";
import { getSchoolPermissionHolderIds } from "./getSchoolPermissionHolderIds";

export async function notifyMaintenanceNoteAdded(params: {
  requestId: string;
  schoolId: string;
  actorId: string;
  reporterId: string;
  assignedOperatorId: string | null;
  title?: string | null;
}): Promise<void> {
  const { requestId, schoolId, actorId, reporterId, assignedOperatorId, title } = params;

  const managerIds = !assignedOperatorId
    ? await getSchoolPermissionHolderIds(schoolId, "maintenance.assign")
    : [];

  const recipientUserIds = Array.from(
    new Set(
      [reporterId, assignedOperatorId, ...managerIds].filter((id): id is string => Boolean(id)),
    ),
  ).filter((id) => id !== actorId);

  if (recipientUserIds.length === 0) {
    return;
  }

  await dispatchModuleNotification({
    recipientUserIds,
    schoolId,
    type: "maintenance",
    title: "maintenance_note_added",
    body: title ? JSON.stringify({ title }) : "maintenance_note_added",
    entityType: "maintenance_request",
    entityId: requestId,
    skipThrottle: true,
  });
}
