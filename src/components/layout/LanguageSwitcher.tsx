"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");

  const targetLocale = locale === "ar" ? "en" : "ar";
  const targetLabel = locale === "ar" ? "English" : "العربية";

  const handleToggle = () => {
    router.replace(pathname, { locale: targetLocale });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="h-8 px-2 text-[11px] font-medium sm:px-3 sm:text-xs"
      aria-label={`${t("language")}: ${targetLabel}`}
    >
      {targetLabel}
    </Button>
  );
}
