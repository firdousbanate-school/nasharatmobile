"use client";

import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useDrawerEscape } from "@/components/layout/useDrawerEscape";
import type { UnifiedCalendarItem } from "@/lib/calendar/types";
import { resolvePublicCalendarItemDetails } from "./resolvePublicCalendarItemDetails";
import { formatPublicEventDateTime } from "./formatPublicEventDateTime";
import { PublicCalendarEventModalBody } from "./PublicCalendarEventModalBody";
import { PublicCalendarEventDetailHeader } from "./PublicCalendarEventDetailHeader";

export function PublicCalendarEventDetailDialog({
  item,
  isOpen,
  locale,
  onClose,
}: {
  item: UnifiedCalendarItem | null;
  isOpen: boolean;
  locale: string;
  onClose: () => void;
}) {
  const tCal = useTranslations("calendar");
  const tCommon = useTranslations("common");

  useDrawerEscape(onClose, isOpen && Boolean(item));

  if (!isOpen || !item || item.kind !== "event") return null;
  if (typeof document === "undefined") return null;

  const event = item.event;
  const { title, location, categoryLabel, pillClass } = resolvePublicCalendarItemDetails(
    item,
    locale,
  );
  const { formattedDate, timeRange } = formatPublicEventDateTime(
    event,
    locale,
    tCal("allDayBadge"),
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-6"
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl dark:border-slate-800 dark:bg-card">
        <PublicCalendarEventDetailHeader
          title={title}
          categoryLabel={categoryLabel}
          pillClass={pillClass}
          onClose={onClose}
          closeLabel={tCommon("close")}
        />

        <div className="overflow-y-auto overscroll-contain p-5 sm:p-6">
          <PublicCalendarEventModalBody
            event={event}
            title={title}
            location={location}
            formattedDate={formattedDate}
            timeRange={timeRange}
            onClose={onClose}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
