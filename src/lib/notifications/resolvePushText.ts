import { parseNotificationJsonBody } from "./parseNotificationJsonBody";
import { resolveNotificationHref } from "./resolveNotificationHref";
import type { NotificationEntityKind, NotificationRow } from "./types";

const PUSH_TITLES: Record<string, string> = {
  circular_published: "تعميم إداري جديد / New Circular",
  circular_response_submitted: "رد قسم على تعميم / Circular Response",
  circular_reminder: "تذكير عاجل بتعميم / Circular Reminder",
  maintenance_assigned: "تم إسناد بلاغ صيانة / Maintenance Assigned",
  maintenance_created: "طلب صيانة جديد / New Maintenance Request",
  maintenance_note_added: "ملاحظة صيانة جديدة / Maintenance Note",
  maintenance_status_updated: "تحديث حالة الصيانة / Maintenance Update",
  calendar_published: "فعالية جديدة بالتقويم / Calendar Event",
};

function formatPushBody(title: string, body?: string | null): string {
  const parsed = parseNotificationJsonBody(body ?? null);
  if (parsed?.title) {
    return parsed.ref ? `#${parsed.ref} — ${parsed.title}` : parsed.title;
  }
  if (parsed?.status) {
    return parsed.status;
  }
  if (!body || title === body) {
    return "";
  }
  return body;
}

export function resolvePushText(params: {
  title: string;
  body?: string | null;
  entityType?: NotificationEntityKind | null;
  entityId?: string | null;
}): { title: string; body: string; url: string } {
  const resolvedTitle = PUSH_TITLES[params.title] ?? params.title;
  const resolvedBody = formatPushBody(params.title, params.body);
  const url =
    resolveNotificationHref({
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
    } as NotificationRow) ?? "/notifications";

  return { title: resolvedTitle, body: resolvedBody, url };
}
