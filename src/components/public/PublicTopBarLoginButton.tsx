"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GraduationCapIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Sticky top bar button linking to the school administrative portal sign-in. */
export function PublicTopBarLoginButton() {
  const locale = useLocale();
  const t = useTranslations("home");

  return (
    <Link href={`/${locale}/login`} className="shrink-0">
      <Button
        size="sm"
        className="h-9 sm:h-10 rounded-xl px-3 sm:px-4 text-xs sm:text-sm font-extrabold gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-sm tracking-wide"
      >
        <GraduationCapIcon className="size-4 sm:size-4.5" />
        <span>{t("portalSignIn")}</span>
        <ArrowRightIcon className="size-3.5 rtl:rotate-180 hidden sm:inline-block transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      </Button>
    </Link>
  );
}
