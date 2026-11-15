/** True only in a browser tab that is hidden and has notification permission. */
export function canShowBackgroundNotification(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (document.visibilityState !== "hidden") return false;
  return "Notification" in window && Notification.permission === "granted";
}
