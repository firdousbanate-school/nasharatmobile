export type BrowserNotificationState = "unsupported" | "granted" | "default" | "denied";

export function getBrowserNotificationState(): BrowserNotificationState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}
