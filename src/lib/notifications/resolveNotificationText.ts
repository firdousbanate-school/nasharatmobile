import { resolveReminderBody } from "./resolveReminderBody";
import { resolveTemplateNotification } from "./resolveTemplateNotification";

type NotificationLike = {
  title: string;
  body: string | null;
  type?: string;
};

type Translator = (key: string, values?: Record<string, string | number>) => string;

const LEGACY_TITLE_MAP: Record<string, string> = {
  "تعميم إداري جديد": "circular_published",
  "تذكير عاجل: استجابة تعميم إداري": "circular_reminder",
  "تم إسناد بلاغ صيانة جديد لك": "maintenance_assigned",
};

export function resolveNotificationText(
  notification: NotificationLike,
  t: Translator,
): { title: string; body: string | null } {
  const templateKey = LEGACY_TITLE_MAP[notification.title] ?? notification.title;

  if (templateKey === "circular_reminder") {
    return {
      title: t("templates.circular_reminder.title"),
      body: resolveReminderBody(notification.body, t),
    };
  }

  const resolved = resolveTemplateNotification(templateKey, notification.body, t);
  if (resolved) {
    return resolved;
  }

  return {
    title: notification.title,
    body: notification.body,
  };
}
