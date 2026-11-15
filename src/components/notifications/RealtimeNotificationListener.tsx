"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/createSupabaseBrowserClient";
import { resolveNotificationHref } from "@/lib/notifications/resolveNotificationHref";
import { resolveNotificationText } from "@/lib/notifications/resolveNotificationText";
import { showBrowserNotification } from "@/lib/notifications/showBrowserNotification";
import { markNotificationReadAction } from "@/actions/notifications/markNotificationReadAction";
import type { NotificationRow } from "@/lib/notifications/types";

export function RealtimeNotificationListener({ userId }: { userId: string }) {
  const router = useRouter();
  const t = useTranslations("notifications");

  useEffect(() => {
    if (!userId) return;

    const supabase = createSupabaseBrowserClient();
    const channelName = `realtime-notifications-${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          const href = resolveNotificationHref(row);
          const content = resolveNotificationText(row, t);

          showBrowserNotification({
            title: content.title,
            body: content.body,
          });

          toast.info(content.title, {
            description: content.body ?? undefined,
            action: href
              ? {
                  label: t("view"),
                  onClick: () => {
                    void markNotificationReadAction(row.id);
                    router.push(href);
                  },
                }
              : undefined,
          });

          router.refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, router, t]);

  return null;
}
