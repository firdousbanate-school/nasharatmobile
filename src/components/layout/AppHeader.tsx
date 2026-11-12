"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PublicInstagramLink } from "@/components/public/PublicInstagramLink";
import { AppUserMenu } from "./AppUserMenu";
import { AppHeaderGreeting } from "./AppHeaderGreeting";
import { MobileBackButton, MobileBrand } from "@/components/mobile";
import type { ProfileRow } from "@/lib/auth/getCurrentProfile";
import type { SchoolRow } from "@/lib/school/getCurrentSchool";

export function AppHeader({
  profile,
  school,
  isOwner = false,
  unreadNotifications = 0,
}: {
  profile: ProfileRow | null;
  school: SchoolRow | null;
  isOwner?: boolean;
  unreadNotifications?: number;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-[calc(3rem+env(safe-area-inset-top))] w-full shrink-0 items-center justify-between border-b-4 border-gold bg-[linear-gradient(90deg,var(--topbar-from,var(--sidebar)),var(--topbar-to,var(--sidebar)))] px-2 pt-[env(safe-area-inset-top)] text-sidebar-foreground max-md:border-b-2 sm:px-6 md:h-16 md:pt-0">
      <div className="flex min-w-0 items-center gap-1 md:gap-3">
        <MobileBackButton />
        <MobileBrand school={school} />
        <AppHeaderGreeting profile={profile} school={school} />
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <PublicInstagramLink />
        <NotificationBell unreadCount={unreadNotifications} />
        {isOwner ? (
          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            <div className="h-5 w-px bg-sidebar-border" />
          </div>
        ) : null}
        <AppUserMenu profile={profile} />
      </div>
    </header>
  );
}
