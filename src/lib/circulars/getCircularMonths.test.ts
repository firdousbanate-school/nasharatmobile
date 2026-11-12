import { describe, it, expect } from "vitest";
import { getCircularMonths } from "./getCircularMonths";
import type { CircularRow } from "./types";

describe("getCircularMonths", () => {
  it("groups circulars by month and includes academic year baseline", () => {
    const circulars: Partial<CircularRow>[] = [
      { id: "1", publish_at: "2026-11-05T10:00:00Z" },
      { id: "2", publish_at: "2026-11-10T12:00:00Z" },
      { id: "3", publish_at: "2026-10-15T09:00:00Z" },
    ];

    const months = getCircularMonths(circulars as CircularRow[], "en");
    expect(months.length).toBeGreaterThanOrEqual(10);

    const nov = months.find((m) => m.key === "2026-11");
    expect(nov?.count).toBe(2);

    const oct = months.find((m) => m.key === "2026-10");
    expect(oct?.count).toBe(1);

    const sep = months.find((m) => m.key === "2026-09");
    expect(sep?.count).toBe(0);
  });

  it("returns baseline academic year months when no circulars are provided", () => {
    const months = getCircularMonths([], "ar");
    expect(months.length).toBe(10);
    expect(months.every((m) => m.count === 0)).toBe(true);
  });
});
