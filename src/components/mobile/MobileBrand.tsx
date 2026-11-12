"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n";
import { SchoolLogoAvatar } from "@/components/layout/SchoolLogoAvatar";
import { resolveSchoolName } from "@/lib/school/resolveSchoolName";
import { parseSchoolNameHierarchy } from "@/lib/school/parseSchoolNameHierarchy";
import type { SchoolRow } from "@/lib/school/getCurrentSchool";
import { getParentPath } from "./getParentPath";

/** School logo + name in the phone top bar. Hidden on nested screens, where the back button shows. */
export function MobileBrand({ school }: { school: SchoolRow | null }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  if (getParentPath(pathname)) return null;

  const schoolName = resolveSchoolName(school, locale, t("portal"));
  const { primaryName } = parseSchoolNameHierarchy(schoolName);

  return (
    <div className="flex min-w-0 items-center gap-2 md:hidden">
      <SchoolLogoAvatar school={school} className="size-8" iconClassName="size-4" />
      <span className="truncate text-sm font-semibold text-sidebar-foreground">
        {primaryName || schoolName}
      </span>
    </div>
  );
}
