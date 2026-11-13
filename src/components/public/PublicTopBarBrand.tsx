"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { PublicSchoolProfileRow } from "@/lib/school/getPublicSchoolProfile";
import { resolveLocalizedText } from "@/lib/school/resolveLocalizedText";
import { parseSchoolNameHierarchy } from "@/lib/school/parseSchoolNameHierarchy";
import { getSchoolLogoUrl } from "@/lib/school/getSchoolLogoUrl";

function resolveBrandMeta(
  locale: string,
  school: PublicSchoolProfileRow | null,
  fallbackTitle: string,
  fallbackSubtitle: string,
) {
  const rawName = resolveLocalizedText(locale, school?.name_ar, school?.name_en);
  const { primaryName } = parseSchoolNameHierarchy(rawName);
  return {
    brand: primaryName || fallbackTitle,
    description: school?.public_description || fallbackSubtitle,
    logoUrl: getSchoolLogoUrl(school?.logo_path),
  };
}

/** School logo placed directly beside the school name, with optional description below. */
export function PublicTopBarBrand({ school }: { school: PublicSchoolProfileRow | null }) {
  const locale = useLocale();
  const t = useTranslations("home");
  const { brand, description, logoUrl } = resolveBrandMeta(
    locale,
    school,
    t("title"),
    t("subtitle"),
  );
  const isArabic = locale === "ar";
  const wrapperClass = isArabic
    ? "flex min-w-0 flex-col items-end gap-1 md:items-start"
    : "flex min-w-0 flex-col items-center gap-1 md:items-start";
  const descVisibilityClass = isArabic ? "hidden md:block " : "";

  return (
    <div className={wrapperClass}>
      <div className="flex max-w-full min-w-0 items-center gap-2 sm:gap-2.5">
        {logoUrl && (
          <Image
            src={logoUrl}
            alt={brand}
            width={40}
            height={40}
            unoptimized
            className="size-9 shrink-0 rounded-full border border-gold/60 bg-white object-contain p-0.5 shadow-sm sm:size-10"
          />
        )}
        <h1 className="truncate text-sm font-black tracking-wide text-sidebar-foreground sm:text-xl">
          {brand}
        </h1>
      </div>
      {description ? (
        <p
          className={`${descVisibilityClass}line-clamp-2 max-w-2xl text-center text-xs font-medium text-sidebar-foreground/80 sm:line-clamp-1 md:text-start`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
