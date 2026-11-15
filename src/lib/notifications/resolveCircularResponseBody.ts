import type { NotificationJsonBody } from "./parseNotificationJsonBody";

type Translator = (key: string, values?: Record<string, string | number>) => string;

export function resolveCircularResponseBody(
  parsed: NotificationJsonBody | null,
  t: Translator,
): string {
  const ref = parsed?.ref;
  const title = parsed?.title;
  if (!ref || !title) {
    return t("templates.circular_response_submitted.body");
  }

  if (parsed.count && parsed.count > 1) {
    return t("templates.circular_response_submitted.bodyGrouped", {
      count: parsed.count,
      ref,
      title,
    });
  }

  if (parsed.department) {
    return t("templates.circular_response_submitted.bodyWithDetails", {
      department: parsed.department,
      ref,
      title,
    });
  }

  return t("templates.circular_response_submitted.body");
}
