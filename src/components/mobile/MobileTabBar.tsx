"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CalendarIcon,
  EllipsisIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  WrenchIcon,
} from "lucide-react";
import { usePathname } from "@/i18n";
import { MobileMoreSheet } from "./MobileMoreSheet";
import { MobileTabBarItem } from "./MobileTabBarItem";

const MORE_PREFIXES = ["/settings", "/reports", "/achievements", "/notifications", "/documents"];

/** Bottom tab bar, phones only. Lives in normal flow at the bottom of the app shell column. */
export function MobileTabBar({
  isOwner = false,
  canManageSettings,
  canViewReports,
  canBackupRestore = false,
  canViewDocuments = false,
}: {
  isOwner?: boolean;
  canManageSettings: boolean;
  canViewReports: boolean;
  canBackupRestore?: boolean;
  canViewDocuments?: boolean;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = MORE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <nav
        aria-label={t("primary")}
        className="flex shrink-0 border-t-2 border-gold bg-[linear-gradient(90deg,var(--topbar-from,var(--sidebar)),var(--topbar-to,var(--sidebar)))] pb-[env(safe-area-inset-bottom)] text-sidebar-foreground md:hidden"
      >
        <MobileTabBarItem
          href="/dashboard"
          label={t("dashboard")}
          icon={LayoutDashboardIcon}
          active={pathname === "/dashboard"}
        />
        <MobileTabBarItem
          href="/circulars"
          label={t("circularsShort")}
          icon={FileTextIcon}
          active={isActive("/circulars")}
        />
        <MobileTabBarItem
          href="/calendar"
          label={t("calendar")}
          icon={CalendarIcon}
          active={isActive("/calendar")}
        />
        <MobileTabBarItem
          href="/maintenance"
          label={t("maintenance")}
          icon={WrenchIcon}
          active={isActive("/maintenance")}
        />
        <MobileTabBarItem
          label={t("more")}
          icon={EllipsisIcon}
          active={isMoreActive || moreOpen}
          onClick={() => setMoreOpen(true)}
        />
      </nav>

      <MobileMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        isOwner={isOwner}
        canManageSettings={canManageSettings}
        canViewReports={canViewReports}
        canBackupRestore={canBackupRestore}
        canViewDocuments={canViewDocuments}
      />
    </>
  );
}
