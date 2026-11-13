"use client";

import { useLocale, useTranslations } from "next-intl";
import { SchoolLogoAvatar } from "@/components/layout/SchoolLogoAvatar";
import { resolveSchoolName } from "@/lib/school/resolveSchoolName";
import { parseSchoolNameHierarchy } from "@/lib/school/parseSchoolNameHierarchy";
import type { SchoolRow } from "@/lib/school/getCurrentSchool";

/** School logo + name in the phone top bar across all authenticated pages. */
export function MobileBrand({ school }: { school: SchoolRow | null }) {
  const t = useTranslations("nav");
  const locale = useLocale();

  const schoolName = resolveSchoolName(school, locale, t("portal"));
  const { primaryName } = parseSchoolNameHierarchy(schoolName);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 md:hidden">
      <SchoolLogoAvatar school={school} className="size-7" iconClassName="size-3.5" />
      <span className="truncate text-xs font-semibold leading-tight text-sidebar-foreground">
        {primaryName || schoolName}
      </span>
    </div>
  );
}
