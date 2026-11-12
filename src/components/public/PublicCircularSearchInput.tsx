"use client";

import { useTranslations } from "next-intl";
import { SearchIcon, XIcon } from "lucide-react";

export function PublicCircularSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const t = useTranslations("home");

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
        <SearchIcon className="size-4" aria-hidden="true" />
      </div>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t("searchPlaceholder")}
        className="w-full rounded-full border border-border/70 bg-card py-2 pe-9 ps-9 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
        aria-label={placeholder ?? t("searchPlaceholder")}
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <XIcon className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
