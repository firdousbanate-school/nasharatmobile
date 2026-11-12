"use client";

import { Link } from "@/i18n";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export function MobileTabBarItem({
  label,
  icon: Icon,
  active,
  href,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const className = cn(
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors",
    active ? "text-gold" : "text-sidebar-foreground/70",
  );
  const content = (
    <>
      <Icon className={cn("size-5", active && "stroke-[2.5]")} />
      <span className="max-w-full truncate">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-current={active ? "page" : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-haspopup="dialog">
      {content}
    </button>
  );
}
