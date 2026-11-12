import { describe, expect, it } from "vitest";
import { isSameDay } from "./isSameDay";

describe("isSameDay", () => {
  it("matches the same local day regardless of time", () => {
    expect(isSameDay(new Date(2026, 9, 28, 1, 0), new Date(2026, 9, 28, 23, 59))).toBe(true);
  });

  it("does not match different days, months or years", () => {
    expect(isSameDay(new Date(2026, 9, 28), new Date(2026, 9, 29))).toBe(false);
    expect(isSameDay(new Date(2026, 9, 28), new Date(2026, 8, 28))).toBe(false);
    expect(isSameDay(new Date(2026, 9, 28), new Date(2025, 9, 28))).toBe(false);
  });
});
