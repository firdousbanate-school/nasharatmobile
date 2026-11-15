import { parseNotificationJsonBody, type NotificationJsonBody } from "./parseNotificationJsonBody";
import { resolveMaintenanceStatusBody } from "./resolveMaintenanceStatusBody";

type Translator = (key: string, values?: Record<string, string | number>) => string;

const TEMPLATE_BODY_BUILDERS: Record<
  string,
  (parsed: NotificationJsonBody | null, t: Translator) => string
> = {
  maintenance_assigned: (_p, t) => t("templates.maintenance_assigned.body"),
  circular_published: (parsed, t) =>
    parsed?.ref && parsed?.title
      ? t("templates.circular_published.bodyWithRef", { ref: parsed.ref, title: parsed.title })
      : t("templates.circular_published.body"),
  maintenance_created: (parsed, t) =>
    parsed?.title
      ? t("templates.maintenance_created.bodyWithTitle", { title: parsed.title })
      : t("templates.maintenance_created.body"),
  calendar_published: (parsed, t) =>
    parsed?.title
      ? t("templates.calendar_published.bodyWithTitle", { title: parsed.title })
      : t("templates.calendar_published.body"),
  maintenance_status_updated: resolveMaintenanceStatusBody,
};

export function resolveTemplateNotification(
  templateKey: string,
  rawBody: string | null,
  t: Translator,
): { title: string; body: string } | null {
  const buildBody = TEMPLATE_BODY_BUILDERS[templateKey];
  if (!buildBody) {
    return null;
  }

  const parsed = parseNotificationJsonBody(rawBody);
  return {
    title: t(`templates.${templateKey}.title`),
    body: buildBody(parsed, t),
  };
}
