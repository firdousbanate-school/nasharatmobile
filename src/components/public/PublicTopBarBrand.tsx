"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { PublicSchoolProfileRow } from "@/lib/school/getPublicSchoolProfile";
import { resolveLocalizedText } from "@/lib/school/resolveLocalizedText";
import { parseSchoolNameHierarchy } from "@/lib/school/parseSchoolNameHierarchy";
import { getSchoolLogoUrl } from "@/lib/school/getSchoolLogoUrl";

/** School logo placed directly beside the school name, with optional description below. */
export function PublicTopBarBrand({ school }: { school: PublicSchoolProfileRow | null }) {
  const locale = useLocale();
  const t = useTranslations("home");

  const rawName = resolveLocalizedText(locale, school?.name_ar, school?.name_en);
  const { primaryName } = parseSchoolNameHierarchy(rawName);
  const brand = primaryName || t("title");
  const description = school?.public_description || t("subtitle");
  const logoUrl = getSchoolLogoUrl(school?.logo_path);

  return (
    <div className="flex min-w-0 flex-col items-center gap-1 md:items-start">
      <div className="flex items-center gap-2.5">
        {logoUrl && (
          <Image
            src={logoUrl}
            alt={brand}
            width={40}
            height={40}
            unoptimized
            className="size-9 sm:size-10 shrink-0 rounded-full border border-gold/60 bg-white object-contain p-0.5 shadow-sm"
          />
        )}
        <h1 className="truncate text-base font-black tracking-wide sm:text-xl text-sidebar-foreground">
          {brand}
        </h1>
      </div>
      {description ? (
        <p className="line-clamp-2 max-w-2xl text-center text-xs font-medium text-sidebar-foreground/80 sm:line-clamp-1 md:text-start">
          {description}
        </p>
      ) : null}
    </div>
  );
}
