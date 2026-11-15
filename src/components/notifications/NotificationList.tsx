"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { BellOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationFilterTabs } from "./NotificationFilterTabs";
import { NotificationDayGroupSection } from "./NotificationDayGroupSection";
import { loadMoreNotificationsAction } from "@/actions/notifications/loadMoreNotificationsAction";
import type { NotificationFilter } from "@/lib/notifications/filterNotifications";
import { groupNotificationsByDay } from "@/lib/notifications/groupNotificationsByDay";
import type { NotificationRow } from "@/lib/notifications/types";

const PAGE_SIZE = 20;

export function NotificationList({
  notifications: initialNotifications,
  initialHasMore = false,
}: {
  notifications: NotificationRow[];
  initialHasMore?: boolean;
}) {
  const t = useTranslations("notifications");
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const [items, setItems] = useState<NotificationRow[]>(initialNotifications);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  const fetchPage = (
    filter: NotificationFilter,
    offset: number,
    limit: number,
    append: boolean,
  ) => {
    startTransition(async () => {
      const res = await loadMoreNotificationsAction({ offset, limit, filter });
      if (res.success) {
        setItems((prev) => (append ? [...prev, ...res.notifications] : res.notifications));
        setHasMore(res.hasMore);
      }
    });
  };

  const { today, earlier } = groupNotificationsByDay(items);

  return (
    <div className="space-y-4">
      <NotificationFilterTabs
        activeFilter={activeFilter}
        disabled={isPending}
        onSelect={(filterKey) => {
          setActiveFilter(filterKey);
          fetchPage(filterKey, 0, PAGE_SIZE, false);
        }}
      />

      {!items.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BellOffIcon className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">{t("empty")}</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t("emptyDesc")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <NotificationDayGroupSection
            title={t("groups.today")}
            items={today}
            onMutated={() => fetchPage(activeFilter, 0, Math.max(items.length, PAGE_SIZE), false)}
          />
          <NotificationDayGroupSection
            title={t("groups.earlier")}
            items={earlier}
            onMutated={() => fetchPage(activeFilter, 0, Math.max(items.length, PAGE_SIZE), false)}
          />
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => fetchPage(activeFilter, items.length, PAGE_SIZE, true)}
              >
                {t("showMore")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
