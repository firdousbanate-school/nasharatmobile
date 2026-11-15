export function showBrowserNotification({
  title,
  body,
}: {
  title: string;
  body?: string | null;
}): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (document.visibilityState !== "hidden") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  try {
    new Notification(title, {
      body: body ?? undefined,
    });
  } catch {
    // Ignore environments where direct Notification construction is restricted
  }
}
