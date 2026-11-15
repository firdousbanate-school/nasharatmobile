"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { NotificationFilter } from "@/lib/notifications/filterNotifications";

const FILTERS: NotificationFilter[] = ["all", "unread", "circular", "maintenance", "calendar"];

export function NotificationFilterTabs({
  activeFilter,
  disabled,
  onSelect,
}: {
  activeFilter: NotificationFilter;
  disabled: boolean;
  onSelect: (filter: NotificationFilter) => void;
}) {
  const t = useTranslations("notifications");

  return (
    <div role="tablist" aria-label={t("title")} className="flex gap-2 overflow-x-auto pb-1">
      {FILTERS.map((filterKey) => (
        <Button
          key={filterKey}
          type="button"
          role="tab"
          aria-selected={activeFilter === filterKey}
          variant={activeFilter === filterKey ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(filterKey)}
          className="min-h-9 shrink-0 rounded-full px-3.5 text-xs font-medium"
        >
          {t(`filters.${filterKey}`)}
        </Button>
      ))}
    </div>
  );
}
