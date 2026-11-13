"use client";

import { ChevronDownIcon, ChevronUpIcon, SearchIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PdfSearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  matchCount: number;
  activeMatchIndex: number;
  isSearching: boolean;
  onPrevMatch: () => void;
  onNextMatch: () => void;
  onClose: () => void;
}

function PdfSearchActions({
  hasMatches,
  onPrevMatch,
  onNextMatch,
  onClose,
}: {
  hasMatches: boolean;
  onPrevMatch: () => void;
  onNextMatch: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("pdfViewer");
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onPrevMatch}
        disabled={!hasMatches}
        aria-label={t("previousMatch")}
        title={t("previousMatch")}
        className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
      >
        <ChevronUpIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onNextMatch}
        disabled={!hasMatches}
        aria-label={t("nextMatch")}
        title={t("nextMatch")}
        className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
      >
        <ChevronDownIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        aria-label={t("closeSearch")}
        title={t("closeSearch")}
        className="min-h-11 min-w-11 md:min-h-8 md:min-w-8"
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  );
}

export function PdfSearchBar({
  query,
  onQueryChange,
  matchCount,
  activeMatchIndex,
  isSearching,
  onPrevMatch,
  onNextMatch,
  onClose,
}: PdfSearchBarProps) {
  const t = useTranslations("pdfViewer");
  const hasMatches = matchCount > 0;
  const showStatus = Boolean(query.trim()) && !isSearching;
  const statusText = hasMatches
    ? t("matchCount", { current: activeMatchIndex + 1, total: matchCount })
    : t("noMatches");

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/80 px-3 py-2">
      <div className="relative flex min-w-0 flex-1 items-center">
        <SearchIcon className="pointer-events-none absolute start-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (e.shiftKey) onPrevMatch();
            else onNextMatch();
          }}
          placeholder={t("searchPlaceholder")}
          aria-label={t("search")}
          autoFocus
          className="h-10 ps-8 text-base md:h-8 md:text-sm"
        />
      </div>
      {showStatus && (
        <span className="text-xs font-medium text-muted-foreground tabular-nums" aria-live="polite">
          {statusText}
        </span>
      )}
      <PdfSearchActions
        hasMatches={hasMatches}
        onPrevMatch={onPrevMatch}
        onNextMatch={onNextMatch}
        onClose={onClose}
      />
    </div>
  );
}
