import { createSupabaseAdminClient } from "@/lib/supabase";
import { dispatchModuleNotification } from "@/lib/notifications/dispatchModuleNotification";
import { getSchoolPermissionHolderIds } from "@/lib/maintenance/getSchoolPermissionHolderIds";
import { logError } from "@/lib/logger/logError";
import { buildCircularResponseNotificationBody } from "./buildCircularResponseNotificationBody";

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
    const [circularRes, departmentRes, publisherIds] = await Promise.all([
      admin
        .from("circulars")
        .select("created_by, ref_number, title")
        .eq("id", circularId)
        .eq("school_id", schoolId)
        .maybeSingle(),
      admin
        .from("departments")
        .select("name")
        .eq("id", departmentId)
        .eq("school_id", schoolId)
        .maybeSingle(),
      getSchoolPermissionHolderIds(schoolId, "circular.publish"),
    ]);
    const lookupError = circularRes.error ?? departmentRes.error;
    if (lookupError) {
      logError(lookupError, { scope: "notifyCircularResponseSubmitted", circularId, schoolId });
    }
    const circular = circularRes.data;
    const department = departmentRes.data;

    const recipientUserIds = Array.from(
      new Set(
        [circular?.created_by as string | undefined, ...publisherIds].filter((id): id is string =>
          Boolean(id),
        ),
      ),
    ).filter((id) => id !== actorUserId);

    if (recipientUserIds.length === 0) {
      return;
    }

    const body = buildCircularResponseNotificationBody(circular, department, status);

    await dispatchModuleNotification({
      recipientUserIds,
      schoolId,
      type: "circular",
      title: "circular_response_submitted",
      body,
      entityType: "circular",
      entityId: circularId,
      skipThrottle: true,
    });
  } catch (error) {
    logError(error, { scope: "notifyCircularResponseSubmitted", circularId, schoolId });
  }
}
