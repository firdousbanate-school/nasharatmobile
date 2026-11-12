"use client";

import { getKuwaitDateParts } from "@/lib/calendar/getKuwaitDateParts";

interface PublicCalendarDateBadgeProps {
  date: string | Date;
  locale?: string;
}

export function PublicCalendarDateBadge({ date }: PublicCalendarDateBadgeProps) {
  const { day } = getKuwaitDateParts(date);
  const monthAbbr = new Date(date)
    .toLocaleDateString("en-US", { month: "short", timeZone: "Asia/Kuwait" })
    .toUpperCase();

  return (
    <div
      className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0c1f44] text-white shadow-sm"
      aria-hidden="true"
      suppressHydrationWarning
    >
      <span className="text-xl font-black leading-tight text-[#e5a93b]" suppressHydrationWarning>
        {day}
      </span>
      <span className="text-[10px] font-bold tracking-wider text-slate-300" suppressHydrationWarning>
        {monthAbbr}
      </span>
    </div>
  );
}

