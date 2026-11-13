"use client";

import { useTranslations } from "next-intl";
import { AwardIcon, BarChart3Icon, BellIcon, DatabaseIcon, SettingsIcon } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { MobileMoreDisplaySettings } from "./MobileMoreDisplaySettings";
import { MobileMoreDocumentLinks } from "./MobileMoreDocumentLinks";
import { MobileMoreLink } from "./MobileMoreLink";

/**
 * Secondary navigation for phones. Permission gating mirrors MobileNavLinks and AppHeader:
 * Documents need `canViewDocuments`; language/theme switchers are owner-only, as in the header.
 */
export function MobileMoreSheet({
  open,
  onClose,
  isOwner = false,
  canManageSettings,
  canViewReports,
  canBackupRestore = false,
  canViewDocuments = false,
}: {
  open: boolean;
  onClose: () => void;
  isOwner?: boolean;
  canManageSettings: boolean;
  canViewReports: boolean;
  canBackupRestore?: boolean;
  canViewDocuments?: boolean;
}) {
  const t = useTranslations("nav");

  return (
    <BottomSheet open={open} onClose={onClose} title={t("more")}>
      <nav aria-label={t("more")} className="flex flex-col">
        <MobileMoreLink
          href="/notifications"
          label={t("notifications")}
          icon={BellIcon}
          onSelect={onClose}
        />
        {isOwner ? (
          <MobileMoreLink
            href="/achievements"
            label={t("achievements")}
            icon={AwardIcon}
            onSelect={onClose}
          />
        ) : null}
        {canViewReports ? (
          <MobileMoreLink
            href="/reports"
            label={t("reports")}
            icon={BarChart3Icon}
            onSelect={onClose}
          />
        ) : null}
        {canViewDocuments ? <MobileMoreDocumentLinks onSelect={onClose} /> : null}
        {canManageSettings ? (
          <MobileMoreLink
            href="/settings"
            label={t("settings")}
            icon={SettingsIcon}
            onSelect={onClose}
          />
        ) : null}
        {canBackupRestore ? (
          <MobileMoreLink
            href="/settings/backup"
            label={t("backup")}
            icon={DatabaseIcon}
            onSelect={onClose}
          />
        ) : null}
      </nav>

      <MobileMoreDisplaySettings />
    </BottomSheet>
  );
}
