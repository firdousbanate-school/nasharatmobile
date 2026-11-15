import { logError } from "@/lib/logger/logError";
import { canShowBackgroundNotification } from "./canShowBackgroundNotification";

/**
 * Shows a system notification while the app is in the background.
 *
 * Android Chrome (and installed PWAs) reject `new Notification()` with
 * "Illegal constructor"; they require `ServiceWorkerRegistration.showNotification`.
 * The page constructor is only used when no service worker is registered
 * (e.g. desktop browsers before registration completes).
 */
export async function showBrowserNotification({
  title,
  body,
  url,
  tag,
}: {
  title: string;
  body?: string | null;
  url?: string | null;
  tag?: string;
}): Promise<void> {
  if (!canShowBackgroundNotification()) return;

  const options: NotificationOptions = {
    body: body ?? undefined,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    tag,
    data: { url: url ?? "/notifications" },
  };

  try {
    const registration =
      "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    if (registration) {
      await registration.showNotification(title, options);
      return;
    }
    new Notification(title, options);
  } catch (error) {
    logError(error, { scope: "showBrowserNotification" });
  }
}
