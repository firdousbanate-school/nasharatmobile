import type { SupabaseClient } from "@supabase/supabase-js";
import { dispatchModuleNotification } from "./dispatchModuleNotification";
import { getDepartmentMemberUserIds } from "@/lib/circulars/getDepartmentMemberUserIds";

export async function sendCircularDeadlineReminders(adminClient: SupabaseClient): Promise<number> {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: circulars } = await adminClient
    .from("circulars")
    .select("id, school_id, ref_number, title")
    .eq("status", "published")
    .gt("due_at", now.toISOString())
    .lte("due_at", next24h.toISOString());

  let totalSent = 0;

  for (const circular of circulars ?? []) {
    const circularId = circular.id as string;
    const schoolId = circular.school_id as string;

    const [{ data: targets }, { data: responses }] = await Promise.all([
      adminClient.from("circular_targets").select("department_id").eq("circular_id", circularId),
      adminClient
        .from("circular_responses")
        .select("department_id")
        .eq("circular_id", circularId)
        .eq("is_latest", true),
    ]);

    const respondedIds = new Set((responses ?? []).map((r) => r.department_id as string));
    const pendingDeptIds = (targets ?? [])
      .map((t) => t.department_id as string)
      .filter((id) => !respondedIds.has(id));

    if (pendingDeptIds.length === 0) continue;

    const recipientIds = await getDepartmentMemberUserIds(adminClient, schoolId, pendingDeptIds);
    if (recipientIds.length === 0) continue;

    const { delivered } = await dispatchModuleNotification({
      recipientUserIds: recipientIds,
      schoolId,
      type: "circular",
      title: "circular_reminder",
      body: JSON.stringify({
        ref: (circular.ref_number as string | null) ?? "",
        title: (circular.title as string | null) ?? "",
      }),
      entityType: "circular",
      entityId: circularId,
      skipThrottle: false,
    });

    totalSent += delivered;
  }

  return totalSent;
}
