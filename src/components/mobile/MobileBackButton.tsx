"use client";

import { useTranslations } from "next-intl";
import { ChevronLeftIcon } from "lucide-react";
import { Link, usePathname } from "@/i18n";
import { getParentPath } from "./getParentPath";

/** Shown on nested screens (e.g. /circulars/123). Standalone iOS PWAs have no browser back button. */
export function MobileBackButton() {
  const t = useTranslations("mobile");
  const pathname = usePathname();
  const parent = getParentPath(pathname);

  if (!parent) return null;

  return (
    <Link
      href={parent}
      aria-label={t("back")}
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-sidebar-foreground active:bg-sidebar-accent md:hidden"
    >
      <ChevronLeftIcon className="size-6 rtl:rotate-180" />
    </Link>
  );
}
