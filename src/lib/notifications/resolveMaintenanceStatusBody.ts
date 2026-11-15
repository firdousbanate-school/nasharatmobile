import type { NotificationJsonBody } from "./parseNotificationJsonBody";

type Translator = (key: string, values?: Record<string, string | number>) => string;

export function resolveMaintenanceStatusBody(
  parsed: NotificationJsonBody | null,
  t: Translator,
): string {
  if (parsed?.title && parsed?.status) {
    return t("templates.maintenance_status_updated.bodyWithTitle", {
      title: parsed.title,
      status: parsed.status,
    });
  }
  if (parsed?.status) {
    return t("templates.maintenance_status_updated.bodyWithStatus", { status: parsed.status });
  }
  return t("templates.maintenance_status_updated.body");
}
