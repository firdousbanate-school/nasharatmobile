"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { CheckCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationReadAction } from "@/actions/notifications/markNotificationReadAction";
import { resolveNotificationHref } from "@/lib/notifications/resolveNotificationHref";
import { resolveNotificationText } from "@/lib/notifications/resolveNotificationText";
import type { NotificationRow } from "@/lib/notifications/types";

export function NotificationBellPopover({
  recent,
  loaded,
  onClose,
}: {
  recent: NotificationRow[];
  loaded: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("notifications");

  return (
    <div className="fixed inset-x-3 top-14 z-50 rounded-xl border border-border bg-card p-3 text-card-foreground shadow-xl md:absolute md:inset-x-auto md:end-0 md:top-full md:mt-2 md:w-80">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-sm font-semibold">{t("title")}</span>
        <Link
          href="/notifications"
          onClick={onClose}
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("viewAll")}
        </Link>
      </div>

      <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
        {loaded && recent.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">{t("empty")}</p>
        )}
        {recent.map((item) => {
          const content = resolveNotificationText(item, t);
          const href = resolveNotificationHref(item) ?? "/notifications";
          const isUnread = !item.read_at;
          return (
            <Link
              key={item.id}
              href={href}
              onClick={() => {
                if (isUnread) void markNotificationReadAction(item.id);
                onClose();
              }}
              className={`block rounded-lg p-2.5 text-start transition-colors hover:bg-muted/60 ${
                isUnread ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-1 text-xs font-semibold text-foreground">
                  {content.title}
                </p>
                {isUnread && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
              </div>
              {content.body && (
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                  {content.body}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-2 border-t border-border pt-2">
        <Link href="/notifications" onClick={onClose} className="block">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
            <CheckCheckIcon className="size-3.5" />
            <span>{t("viewAll")}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
