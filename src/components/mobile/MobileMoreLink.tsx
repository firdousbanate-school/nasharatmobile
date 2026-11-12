"use client";

import { Link } from "@/i18n";
import { ChevronRightIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function MobileMoreLink({
  href,
  label,
  icon: Icon,
  onSelect,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex min-h-12 items-center gap-3 rounded-lg px-2 text-sm font-medium text-foreground active:bg-muted"
    >
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate">{label}</span>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
    </Link>
  );
}
