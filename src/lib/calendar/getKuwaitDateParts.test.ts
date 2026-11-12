import { describe, it, expect } from "vitest";
import { getKuwaitDateParts } from "./getKuwaitDateParts";

describe("getKuwaitDateParts", () => {
  it("extracts the Kuwait date regardless of UTC day boundary", () => {
    // 2026-11-12T22:00:00Z is 2026-11-13 01:00:00 in Asia/Kuwait (UTC+3)
    const parts = getKuwaitDateParts("2026-11-12T22:00:00Z");
    expect(parts).toEqual({ year: 2026, month: 10, day: 13 });
  });

  it("handles invalid dates gracefully", () => {
    expect(getKuwaitDateParts("invalid-date")).toEqual({ year: 1970, month: 0, day: 1 });
  });
});
