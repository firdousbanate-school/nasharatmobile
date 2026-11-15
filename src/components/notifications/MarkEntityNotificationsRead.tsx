"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n";
import { markEntityNotificationsReadAction } from "@/actions/notifications/markEntityNotificationsReadAction";
import type { NotificationEntityKind } from "@/lib/notifications/types";

/**
 * Marks notifications for the viewed entity as read once the detail page is
 * actually shown, then refreshes so the header bell badge reflects it.
 */
export function MarkEntityNotificationsRead({
  entityType,
  entityId,
}: {
  entityType: NotificationEntityKind;
  entityId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    void markEntityNotificationsReadAction(entityType, entityId).then((res) => {
      if (active && res.success && res.updated > 0) {
        router.refresh();
      }
    });
    return () => {
      active = false;
    };
  }, [entityType, entityId, router]);

  return null;
}
