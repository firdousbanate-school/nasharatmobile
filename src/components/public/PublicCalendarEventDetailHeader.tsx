"use client";

import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicCalendarEventDetailHeader({
  title,
  categoryLabel,
  pillClass,
  onClose,
  closeLabel,
}: {
  title: string;
  categoryLabel: string;
  pillClass: string;
  onClose: () => void;
  closeLabel: string;
}) {
  return (
    <div className="shrink-0 border-b border-slate-100 bg-white/95 px-5 py-4 sm:px-6 sm:pt-6 sm:pb-4 backdrop-blur-xs dark:border-slate-800 dark:bg-card/95">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${pillClass}`}
          >
            {categoryLabel}
          </span>
          <h2 className="font-heading text-lg font-extrabold text-[#0c1f44] sm:text-2xl dark:text-white break-words">
            {title}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="shrink-0 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={closeLabel}
        >
          <XIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
}
