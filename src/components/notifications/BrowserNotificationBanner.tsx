"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { BellRingIcon, SettingsIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getBrowserNotificationState,
  type BrowserNotificationState,
} from "@/lib/notifications/getBrowserNotificationState";
import { subscribeToWebPush } from "@/lib/notifications/subscribeToWebPush";

export function BrowserNotificationBanner() {
  const t = useTranslations("notifications.browserPermission");
  const browserState = useSyncExternalStore(
    () => () => {},
    getBrowserNotificationState,
    (): BrowserNotificationState => "unsupported",
  );
  const [overrideState, setOverrideState] = useState<BrowserNotificationState | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const state = overrideState ?? browserState;

  useEffect(() => {
    if (state === "granted") {
      void subscribeToWebPush();
    }
  }, [state]);

  if (dismissed || state === "unsupported" || state === "granted") {
    return null;
  }

  const isDenied = state === "denied";

  const handleEnable = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const nextState = await Notification.requestPermission();
    setOverrideState(nextState);
    if (nextState === "granted") {
      void subscribeToWebPush();
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isDenied ? <SettingsIcon className="size-4" /> : <BellRingIcon className="size-4" />}
        </div>
        <div className="space-y-1 text-start">
          <h3 className="text-sm font-semibold text-foreground">
            {t(isDenied ? "blockedTitle" : "promptTitle")}
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t(isDenied ? "blockedDesc" : "promptDesc")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {!isDenied && (
          <Button type="button" size="sm" onClick={() => void handleEnable()} className="text-xs">
            {t("enableBtn")}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          aria-label={t("dismiss")}
          className="size-8 text-muted-foreground"
        >
          <XIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
