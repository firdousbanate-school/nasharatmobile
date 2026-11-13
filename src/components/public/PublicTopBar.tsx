"use client";

import { useLocale } from "next-intl";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { PublicInstagramLink } from "./PublicInstagramLink";
import { PublicTopBarLoginButton } from "./PublicTopBarLoginButton";
import { PublicTopBarBrand } from "./PublicTopBarBrand";
import { KuwaitMoeLink } from "./KuwaitMoeLink";
import { PublicTopBarTicker } from "./PublicTopBarTicker";
import type { CalendarEventRow } from "@/lib/calendar/types";
import type { PublicSchoolProfileRow } from "@/lib/school/getPublicSchoolProfile";

/** Navy top bar with Kuwait MOE branding, school logo/name underneath, Instagram link, and ticker. */
export function PublicTopBar({
  school,
  events,
  isOwner = false,
}: {
  school: PublicSchoolProfileRow | null;
  events: CalendarEventRow[];
  isOwner?: boolean;
}) {
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <header className="sticky top-0 z-50 border-b-4 border-gold bg-[linear-gradient(90deg,var(--topbar-from,var(--sidebar)),var(--topbar-to,var(--sidebar)))] text-sidebar-foreground shadow-md">
      <div className="mx-auto flex w-full max-w-[1720px] flex-col items-center justify-between gap-4 px-4 py-3 sm:px-8 md:flex-row lg:px-12 xl:px-16">
        <div
          className={
            isArabic
              ? "flex w-full min-w-0 flex-row items-center justify-between gap-2 md:w-auto md:flex-col md:items-start md:gap-2.5"
              : "flex min-w-0 flex-col items-center gap-2.5 md:items-start"
          }
        >
          <KuwaitMoeLink className={isArabic ? "shrink-0" : ""} />
          <PublicTopBarBrand school={school} />
        </div>

        <div
          className={
            isArabic
              ? "relative flex w-full shrink-0 items-center justify-center gap-2.5 md:w-auto md:justify-end"
              : "flex shrink-0 items-center justify-center gap-2.5 md:justify-end"
          }
        >
          <div
            className={
              isArabic ? "absolute end-0 top-1/2 -translate-y-1/2 md:static md:translate-y-0" : ""
            }
          >
            <PublicInstagramLink url={school?.instagram_url} />
          </div>
          <PublicTopBarLoginButton />
          {isOwner ? (
            <>
              <LanguageSwitcher />
              <ThemeToggle />
            </>
          ) : null}
        </div>
      </div>

      <PublicTopBarTicker events={events} />
    </header>
  );
}
