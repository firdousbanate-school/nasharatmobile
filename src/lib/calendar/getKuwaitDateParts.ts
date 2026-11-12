const KUWAIT_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kuwait",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export interface KuwaitDateParts {
  year: number;
  month: number;
  day: number;
}

/**
 * Extracts year, 0-indexed month, and day-of-month in the Asia/Kuwait timezone
 * so SSR (UTC) and client browsers in any timezone produce identical calendar dates.
 */
export function getKuwaitDateParts(input: Date | string): KuwaitDateParts {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return { year: 1970, month: 0, day: 1 };
  }
  const formatted = KUWAIT_FORMATTER.format(date);
  const [y, m, d] = formatted.split("-").map(Number);
  return {
    year: y,
    month: m - 1,
    day: d,
  };
}
