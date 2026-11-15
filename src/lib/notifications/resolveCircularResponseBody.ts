import type { NotificationJsonBody } from "./parseNotificationJsonBody";

type Translator = (key: string, values?: Record<string, string | number>) => string;

export function resolveCircularResponseBody(
  parsed: NotificationJsonBody | null,
  t: Translator,
): string {
  if (parsed?.department && parsed?.ref && parsed?.title) {
    return t("templates.circular_response_submitted.bodyWithDetails", {
      department: parsed.department,
      ref: parsed.ref,
      title: parsed.title,
    });
  }

  return t("templates.circular_response_submitted.body");
}
