export interface NotificationJsonBody {
  ref?: string;
  title?: string;
  status?: string;
  priority?: string;
  department?: string;
}

export function parseNotificationJsonBody(body: string | null): NotificationJsonBody | null {
  if (!body || !body.startsWith("{")) {
    return null;
  }

  try {
    const parsed = JSON.parse(body) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as NotificationJsonBody;
    }
  } catch {
    // Ignore malformed JSON and let the caller fall back to default text
  }

  return null;
}
