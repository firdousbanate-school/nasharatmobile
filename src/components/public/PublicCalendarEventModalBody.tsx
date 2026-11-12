"use client";

import { useTranslations } from "next-intl";
import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarEventImageBanner } from "@/components/calendar/CalendarEventImageBanner";
import type { CalendarEventRow } from "@/lib/calendar/types";

export function PublicCalendarEventModalBody({
  event,
  title,
  location,
  formattedDate,
  timeRange,
  onClose,
}: {
  event: CalendarEventRow;
  title: string;
  location: string | null;
  formattedDate: string;
  timeRange: string;
  onClose: () => void;
}) {
  const tCal = useTranslations("calendar");
  const tCommon = useTranslations("common");

  return (
    <div className="mt-5 space-y-5">
      <CalendarEventImageBanner imagePath={event.image_path} altText={title} />

      <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-50/70 p-4 sm:grid-cols-2 dark:bg-slate-900/40">
        <div className="flex items-center gap-2.5 text-xs">
          <CalendarIcon className="size-4 shrink-0 text-[#e5a93b]" aria-hidden="true" />
          <div>
            <div className="text-muted-foreground">{tCal("startsAt")}</div>
            <div className="font-semibold text-foreground">{formattedDate}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <ClockIcon className="size-4 shrink-0 text-[#e5a93b]" aria-hidden="true" />
          <div>
            <div className="text-muted-foreground">{tCal("endsAt")}</div>
            <div className="font-semibold text-foreground">{timeRange}</div>
          </div>
        </div>
        {location && (
          <div className="flex items-center gap-2.5 text-xs sm:col-span-2">
            <MapPinIcon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="font-medium text-foreground">{location}</span>
          </div>
        )}
      </div>

      {event.description && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {tCal("eventDescription")}
          </h3>
          <p className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground dark:border-slate-800 dark:bg-card">
            {event.description}
          </p>
        </div>
      )}

      <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
        <Button
          variant="outline"
          onClick={onClose}
          className="rounded-xl px-5 font-semibold text-[#0c1f44] hover:bg-slate-100 dark:text-white"
        >
          {tCommon("close")}
        </Button>
      </div>
    </div>
  );
}
