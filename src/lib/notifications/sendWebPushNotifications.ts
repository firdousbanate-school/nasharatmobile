import { setVapidDetails, sendNotification } from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logError } from "@/lib/logger/logError";
import { getVapidConfig } from "./getVapidConfig";
import { resolvePushText } from "./resolvePushText";
import type { NotificationEntityKind } from "./types";

interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendWebPushNotifications(
  adminClient: SupabaseClient,
  params: {
    userIds: string[];
    schoolId: string;
    title: string;
    body?: string | null;
    entityType?: NotificationEntityKind | null;
    entityId?: string | null;
  },
): Promise<number> {
  const { userIds, schoolId, title, body, entityType, entityId } = params;
  if (userIds.length === 0) return 0;

  const vapid = getVapidConfig();
  if (!vapid) return 0;

  try {
    const { data, error } = await adminClient
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .in("user_id", userIds)
      .eq("school_id", schoolId);

    if (error || !data?.length) return 0;

    setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
    const payload = JSON.stringify({
      ...resolvePushText({ title, body, entityType, entityId }),
      tag: entityId ?? title,
    });

    const expiredIds: string[] = [];
    const results = await Promise.allSettled(
      (data as PushSubscriptionRow[]).map(async (sub) => {
        try {
          await sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          );
          return true;
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            expiredIds.push(sub.id);
          } else {
            logError(err, { scope: "sendWebPushNotifications.send", subscriptionId: sub.id });
          }
          return false;
        }
      }),
    );

    if (expiredIds.length > 0) {
      await adminClient.from("push_subscriptions").delete().in("id", expiredIds);
    }

    return results.filter((r) => r.status === "fulfilled" && r.value).length;
  } catch (error) {
    logError(error, { scope: "sendWebPushNotifications", schoolId });
    return 0;
  }
}
