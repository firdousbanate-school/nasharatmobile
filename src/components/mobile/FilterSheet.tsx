"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { BottomSheet } from "./BottomSheet";

/**
 * Phones: a single "Filters" button (with active-count badge) that opens the filters in a sheet.
 * md and up: the filters are rendered inline, exactly as before.
 */
export function FilterSheet({
  activeCount = 0,
  children,
}: {
  activeCount?: number;
  children: ReactNode;
}) {
  const t = useTranslations("mobile");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium md:hidden"
      >
        <SlidersHorizontalIcon className="size-4" />
        {t("filters")}
        {activeCount > 0 ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </button>

      <div className="hidden md:contents">{children}</div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={t("filters")}>
        <div className="flex flex-col gap-3 pb-2 [&_[data-slot=select-trigger]]:h-11 [&_[data-slot=select-trigger]]:w-full [&_select]:h-11 [&_select]:w-full [&_select]:text-base [&>div]:flex-col [&>div]:items-stretch">
          {children}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2 min-h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
        >
          {t("apply")}
        </button>
      </BottomSheet>
    </>
  );
}
