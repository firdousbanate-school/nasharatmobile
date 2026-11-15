import { dispatchModuleNotification } from "@/lib/notifications/dispatchModuleNotification";
import { getSchoolPermissionHolderIds } from "./getSchoolPermissionHolderIds";

export async function notifyMaintenanceCreated(params: {
  requestId: string;
  schoolId: string;
  reporterId: string;
  title: string;
  priority: string;
}): Promise<void> {
  const { requestId, schoolId, reporterId, title, priority } = params;

  const managerIds = await getSchoolPermissionHolderIds(schoolId, "maintenance.assign");
  const recipientUserIds = managerIds.filter((id) => id !== reporterId);
  if (recipientUserIds.length === 0) {
    return;
  }

  await dispatchModuleNotification({
    recipientUserIds,
    schoolId,
    type: "maintenance",
    title: "maintenance_created",
    body: JSON.stringify({ title, priority }),
    entityType: "maintenance_request",
    entityId: requestId,
  });
}
