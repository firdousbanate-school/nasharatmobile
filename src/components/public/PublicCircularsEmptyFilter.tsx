"use client";

import { useTranslations } from "next-intl";
import { SearchXIcon, RotateCcwIcon } from "lucide-react";

export function PublicCircularsEmptyFilter({ onReset }: { onReset: () => void }) {
  const t = useTranslations("home");

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 text-center space-y-3">
      <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchXIcon className="size-5" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{t("noFilteredCirculars")}</p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
      >
        <RotateCcwIcon className="size-3" aria-hidden="true" />
        <span>{t("clearFilters")}</span>
      </button>
    </div>
  );
}
