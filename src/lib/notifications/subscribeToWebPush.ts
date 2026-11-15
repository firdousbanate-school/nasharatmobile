import { logError } from "@/lib/logger/logError";
import { urlBase64ToUint8Array } from "./urlBase64ToUint8Array";

export async function subscribeToWebPush(): Promise<boolean> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!publicKey || typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const res = await fetch("/api/notifications/push-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(subscription.toJSON()),
    });

    return res.ok;
  } catch (error) {
    logError(error, { scope: "subscribeToWebPush" });
    return false;
  }
}
