import { createSupabaseAdminClient } from "@/lib/supabase";
import { logError } from "@/lib/logger/logError";
import { filterRecipientsByPreferences } from "./filterRecipientsByPreferences";
import { insertBatchNotificationRecords } from "./insertBatchNotificationRecords";
import { sendWebPushNotifications } from "./sendWebPushNotifications";
import type { NotificationType, NotificationEntityKind } from "./types";

export type DispatchNotificationResult = {
  delivered: number;
};

/**
 * Writes in-app notifications and dispatches Web Push for a set of recipients.
 *
 * Notifications are inserted with the service-role client, so RLS cannot
 * constrain `user_id`. Recipients are therefore resolved against `profiles`
 * first: only active members of `schoolId` survive. A caller that supplies a
 * foreign user id (audit finding H-12) notifies nobody instead of reaching into
 * another tenant. No school context means no dispatch — the function fails
 * closed rather than guessing a tenant.
 */
export async function dispatchModuleNotification({
  recipientUserIds,
  schoolId,
  type,
  title,
  body,
  entityType,
  entityId,
  skipThrottle,
}: {
  recipientUserIds: string[];
  schoolId?: string | null;
  type: NotificationType;
  title: string;
  body?: string | null;
  entityType?: NotificationEntityKind | null;
  entityId?: string | null;
  skipThrottle?: boolean;
}): Promise<DispatchNotificationResult> {
  const uniqueUserIds = Array.from(new Set(recipientUserIds.filter(Boolean)));
  if (!uniqueUserIds.length || !schoolId) return { delivered: 0 };

  try {
    const adminClient = createSupabaseAdminClient();
    const { data: members, error } = await adminClient
      .from("profiles")
      .select("id")
      .in("id", uniqueUserIds)
      .eq("school_id", schoolId)
      .eq("is_active", true);

    if (error) {
      logError(error, { scope: "dispatchModuleNotification", schoolId });
      return { delivered: 0 };
    }

    const allowedIds = (members ?? []).map((member) => member.id as string);
    if (!allowedIds.length) return { delivered: 0 };

    const { inAppUserIds, pushUserIds } = await filterRecipientsByPreferences(
      adminClient,
      allowedIds,
      type,
    );

    const [delivered] = await Promise.all([
      inAppUserIds.length > 0
        ? insertBatchNotificationRecords(adminClient, {
            userIds: inAppUserIds,
            schoolId,
            type,
            title,
            body,
            entityType,
            entityId,
            skipThrottle,
          })
        : Promise.resolve(0),
      sendWebPushNotifications(adminClient, {
        userIds: pushUserIds,
        schoolId,
        title,
        body,
        entityType,
        entityId,
      }),
    ]);

    return { delivered };
  } catch (error) {
    logError(error, { scope: "dispatchModuleNotification", schoolId });
    return { delivered: 0 };
  }
}
