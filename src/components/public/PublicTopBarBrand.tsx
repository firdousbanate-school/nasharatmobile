"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { PublicSchoolProfileRow } from "@/lib/school/getPublicSchoolProfile";
import { resolveLocalizedText } from "@/lib/school/resolveLocalizedText";
import { parseSchoolNameHierarchy } from "@/lib/school/parseSchoolNameHierarchy";
import { getSchoolLogoUrl } from "@/lib/school/getSchoolLogoUrl";

/** Centered school logo, primary name, and description inside the public top bar. */
export function PublicTopBarBrand({ school }: { school: PublicSchoolProfileRow | null }) {
  const locale = useLocale();
  const t = useTranslations("home");

  const rawName = resolveLocalizedText(locale, school?.name_ar, school?.name_en);
  const { primaryName } = parseSchoolNameHierarchy(rawName);
  const brand = primaryName || t("title");
  const description = school?.public_description || t("subtitle");
  const logoUrl = getSchoolLogoUrl(school?.logo_path);

  return (
    <div className="flex min-w-0 items-center justify-center gap-3">
      {logoUrl && (
        <Image
          src={logoUrl}
          alt={brand}
          width={48}
          height={48}
          unoptimized
          className="size-11 sm:size-12 shrink-0 rounded-full border border-gold/60 bg-white object-contain p-0.5 shadow-sm"
        />
      )}
      <div className="min-w-0 space-y-0.5 text-center sm:text-start">
        <h1 className="truncate text-base font-black tracking-wide sm:text-xl text-sidebar-foreground">
          {brand}
        </h1>
        {description ? (
          <p className="line-clamp-2 text-xs font-medium text-sidebar-foreground/80 sm:line-clamp-1 max-w-2xl">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
