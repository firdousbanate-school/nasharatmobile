"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function NotificationPreferenceRow({
  label,
  inAppEnabled,
  pushEnabled,
  disabled,
  onToggleInApp,
  onTogglePush,
}: {
  label: string;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  disabled: boolean;
  onToggleInApp: () => void;
  onTogglePush: () => void;
}) {
  const t = useTranslations("notifications.preferences");

  return (
    <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={disabled}
          variant={inAppEnabled ? "default" : "outline"}
          onClick={onToggleInApp}
          className="min-h-8 text-xs"
        >
          {t("inApp")}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={disabled}
          variant={pushEnabled ? "default" : "outline"}
          onClick={onTogglePush}
          className="min-h-8 text-xs"
        >
          {t("push")}
        </Button>
      </div>
    </div>
  );
}
