import type { SupabaseClient } from "@supabase/supabase-js";
import { parseNotificationJsonBody } from "@/lib/notifications/parseNotificationJsonBody";

export async function updateExistingResponseNotifications(
  admin: SupabaseClient,
  params: {
    recipientUserIds: string[];
    circularId: string;
    ref: string;
    title: string;
    department: string;
    status: string;
  },
): Promise<string[]> {
  const { recipientUserIds, circularId, ref, title, department, status } = params;
  const { data: existingRows } = await admin
    .from("notifications")
    .select("id, user_id, body")
    .in("user_id", recipientUserIds)
    .eq("type", "circular")
    .eq("title", "circular_response_submitted")
    .eq("entity_type", "circular")
    .eq("entity_id", circularId)
    .is("read_at", null);

  const updatedUsers = new Set<string>();
  const now = new Date().toISOString();

  for (const row of existingRows ?? []) {
    const prev = parseNotificationJsonBody((row.body as string | null) ?? null);
    const nextCount = (prev?.count ?? 1) + 1;
    const nextBody = JSON.stringify({ ref, title, department, status, count: nextCount });
    await admin.from("notifications").update({ body: nextBody, created_at: now }).eq("id", row.id);
    updatedUsers.add(row.user_id as string);
  }

  return recipientUserIds.filter((id) => !updatedUsers.has(id));
}
