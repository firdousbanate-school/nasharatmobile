"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBellPopover } from "./NotificationBellPopover";
import { syncAppBadge } from "@/lib/notifications/syncAppBadge";
import { loadMoreNotificationsAction } from "@/actions/notifications/loadMoreNotificationsAction";
import type { NotificationRow } from "@/lib/notifications/types";

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<NotificationRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    syncAppBadge(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      void loadMoreNotificationsAction({ offset: 0, limit: 5, filter: "all" }).then((res) => {
        if (res.success) {
          setRecent(res.notifications);
          setLoaded(true);
        }
      });
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        aria-expanded={open}
        className="relative text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        aria-label={t("title")}
      >
        <BellIcon className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute end-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-0.5 text-[10px] leading-none font-bold text-gold-foreground ring-2 ring-sidebar">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <NotificationBellPopover recent={recent} loaded={loaded} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}
