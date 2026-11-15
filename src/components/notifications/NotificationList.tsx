"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BellOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./NotificationItem";
import {
  filterNotifications,
  type NotificationFilter,
} from "@/lib/notifications/filterNotifications";
import type { NotificationRow } from "@/lib/notifications/types";

const PAGE_SIZE = 10;

const FILTERS: NotificationFilter[] = ["all", "unread", "circular", "maintenance", "calendar"];

export function NotificationList({ notifications }: { notifications: NotificationRow[] }) {
  const t = useTranslations("notifications");
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const filtered = filterNotifications(notifications, activeFilter);
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label={t("title")} className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filterKey) => {
          const isActive = activeFilter === filterKey;
          return (
            <Button
              key={filterKey}
              type="button"
              role="tab"
              aria-selected={isActive}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveFilter(filterKey);
                setVisibleCount(PAGE_SIZE);
              }}
              className="min-h-9 shrink-0 rounded-full px-3.5 text-xs font-medium"
            >
              {t(`filters.${filterKey}`)}
            </Button>
          );
        })}
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <BellOffIcon className="size-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">{t("empty")}</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{t("emptyDesc")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
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
