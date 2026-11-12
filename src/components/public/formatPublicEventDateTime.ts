import type { CalendarEventRow } from "@/lib/calendar/types";

export function formatPublicEventDateTime(
  event: CalendarEventRow,
  locale: string,
  allDayLabel: string,
) {
  const intlLocale = locale === "ar" ? "ar-EG" : "en-US";
  const startDate = new Date(event.starts_at);
  const endDate = new Date(event.ends_at);

  const formattedDate = startDate.toLocaleDateString(intlLocale, {
    timeZone: "Asia/Kuwait",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeRange = event.all_day
    ? allDayLabel
    : `${startDate.toLocaleTimeString(intlLocale, { timeZone: "Asia/Kuwait", hour: "2-digit", minute: "2-digit" })} – ${endDate.toLocaleTimeString(intlLocale, { timeZone: "Asia/Kuwait", hour: "2-digit", minute: "2-digit" })}`;

  return { formattedDate, timeRange };
}
