"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { CheckIcon, ExternalLinkIcon, MailIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationReadAction } from "@/actions/notifications/markNotificationReadAction";
import { markNotificationUnreadAction } from "@/actions/notifications/markNotificationUnreadAction";
import { deleteNotificationAction } from "@/actions/notifications/deleteNotificationAction";

export function NotificationItemActions({
  notificationId,
  isUnread,
  href,
  isPending,
  onRunAction,
}: {
  notificationId: string;
  isUnread: boolean;
  href: string | null;
  isPending: boolean;
  onRunAction: (action: () => Promise<{ success: boolean; error?: string }>) => void;
}) {
  const t = useTranslations("notifications");

  return (
    <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
      {isUnread ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRunAction(() => markNotificationReadAction(notificationId))}
          disabled={isPending}
          className="gap-1 text-xs"
        >
          <CheckIcon className="size-3.5" />
          <span>{t("markRead")}</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRunAction(() => markNotificationUnreadAction(notificationId))}
          disabled={isPending}
          className="gap-1 text-xs text-muted-foreground"
        >
          <MailIcon className="size-3.5" />
          <span>{t("markUnread")}</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRunAction(() => deleteNotificationAction(notificationId))}
        disabled={isPending}
        aria-label={t("delete")}
        className="size-8 text-muted-foreground hover:text-destructive"
      >
        <Trash2Icon className="size-3.5" />
      </Button>
      {href && (
        <Link href={href} onClick={() => void markNotificationReadAction(notificationId)}>
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <span>{t("viewDetails")}</span>
            <ExternalLinkIcon className="size-3.5" />
          </Button>
        </Link>
      )}
    </div>
  );
}
