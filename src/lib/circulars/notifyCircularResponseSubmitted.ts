import { createSupabaseAdminClient } from "@/lib/supabase";
import { dispatchModuleNotification } from "@/lib/notifications/dispatchModuleNotification";
import { getSchoolPermissionHolderIds } from "@/lib/maintenance/getSchoolPermissionHolderIds";
import { logError } from "@/lib/logger/logError";

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
    const [{ data: circular }, { data: department }, publisherIds] = await Promise.all([
      admin
        .from("circulars")
        .select("created_by, ref_number, title")
        .eq("id", circularId)
        .maybeSingle(),
      admin.from("departments").select("name").eq("id", departmentId).maybeSingle(),
      getSchoolPermissionHolderIds(schoolId, "circular.publish"),
    ]);

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

    const body = JSON.stringify({
      ref: (circular?.ref_number as string | undefined) ?? "",
      title: (circular?.title as string | undefined) ?? "",
      department: (department?.name as string | undefined) ?? "",
      status,
    });

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
