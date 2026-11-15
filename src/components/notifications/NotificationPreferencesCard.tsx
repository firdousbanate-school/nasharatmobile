"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronDownIcon, SlidersHorizontalIcon } from "lucide-react";
import { NotificationPreferenceRow } from "./NotificationPreferenceRow";
import { updateNotificationPreferencesAction } from "@/actions/notifications/updateNotificationPreferencesAction";
import type { NotificationPreferences } from "@/lib/notifications/getNotificationPreferences";

type ModuleKey = "circular" | "maintenance" | "calendar";

const MODULES: ModuleKey[] = ["circular", "maintenance", "calendar"];

export function NotificationPreferencesCard({
  initialPreferences,
}: {
  initialPreferences: NotificationPreferences;
}) {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>(initialPreferences);
  const [isPending, startTransition] = useTransition();

  const toggleKey = (key: keyof NotificationPreferences) => {
    const nextPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(nextPrefs);
    startTransition(async () => {
      const res = await updateNotificationPreferencesAction(nextPrefs);
      if (!res.success) {
        setPrefs(prefs);
        toast.error(res.error ?? tCommon("error"));
      }
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between px-4 py-2.5 text-start text-sm font-medium text-foreground"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          <span>{t("preferences.title")}</span>
        </span>
        <ChevronDownIcon
          className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-border p-4">
          <p className="text-xs text-muted-foreground">{t("preferences.subtitle")}</p>
          <div className="divide-y divide-border rounded-md border border-border">
            {MODULES.map((mod) => {
              const inAppKey = `${mod}_in_app` as keyof NotificationPreferences;
              const pushKey = `${mod}_push` as keyof NotificationPreferences;
              return (
                <NotificationPreferenceRow
                  key={mod}
                  label={t(`types.${mod}`)}
                  inAppEnabled={prefs[inAppKey]}
                  pushEnabled={prefs[pushKey]}
                  disabled={isPending}
                  onToggleInApp={() => toggleKey(inAppKey)}
                  onTogglePush={() => toggleKey(pushKey)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
