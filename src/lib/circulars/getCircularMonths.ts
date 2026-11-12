import type { CircularRow } from "./types";

export interface CircularMonthOption {
  key: string;
  label: string;
  count: number;
}

const BASELINE_MONTHS = [
  "2026-09",
  "2026-10",
  "2026-11",
  "2026-12",
  "2027-01",
  "2027-02",
  "2027-03",
  "2027-04",
  "2027-05",
  "2027-06",
];

export function getCircularMonths(
  circulars: CircularRow[] = [],
  locale = "ar",
): CircularMonthOption[] {
  const monthMap = new Map<string, { label: string; count: number; timestamp: number }>();

  for (const ym of BASELINE_MONTHS) {
    const [y, m] = ym.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, 1));
    const label = date.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    monthMap.set(ym, {
      label,
      count: 0,
      timestamp: date.getTime(),
    });
  }

  for (const circular of circulars) {
    const rawDate = circular.publish_at || circular.created_at;
    if (!rawDate) continue;

    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) continue;

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const key = `${year}-${month}`;

    const existing = monthMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      const firstOfMonth = new Date(Date.UTC(year, date.getUTCMonth(), 1));
      const label = firstOfMonth.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
      monthMap.set(key, {
        label,
        count: 1,
        timestamp: firstOfMonth.getTime(),
      });
    }
  }

  return Array.from(monthMap.entries())
    .sort((a, b) => b[1].timestamp - a[1].timestamp)
    .map(([key, data]) => ({
      key,
      label: data.label,
      count: data.count,
    }));
}
