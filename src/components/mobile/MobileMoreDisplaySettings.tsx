"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/** Language and theme rows for the More sheet (owner-only, matching the desktop header). */
export function MobileMoreDisplaySettings() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border py-3">
        <span className="text-sm font-medium text-foreground">{tCommon("language")}</span>
        <LanguageSwitcher />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border py-3">
        <span className="text-sm font-medium text-foreground">{t("appearance")}</span>
        <ThemeToggle />
      </div>
    </>
  );
}
