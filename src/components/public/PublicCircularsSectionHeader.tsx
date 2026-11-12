"use client";

import { useTranslations } from "next-intl";

export function PublicCircularsSectionHeader() {
  const t = useTranslations("home");

  return (
    <div className="space-y-3 text-center">
      <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-bold text-gold">
        <span className="h-0.5 w-12 rounded-full bg-gold/70" />
        <span>{t("circularsEyebrow")}</span>
        <span className="h-0.5 w-12 rounded-full bg-gold/70" />
      </div>

      <h2 className="font-heading text-2xl font-black tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-4xl dark:text-foreground">
        {t("circularsTitle")}
      </h2>

      <div className="mx-auto h-1 w-12 rounded-full bg-[#e5a93b]" aria-hidden="true" />

      <p className="mx-auto max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground sm:text-base">
        {t("circularsSubtitle")}
      </p>
    </div>
  );
}
