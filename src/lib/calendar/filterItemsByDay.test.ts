import { describe, expect, it } from "vitest";
import { filterItemsByDay } from "./filterItemsByDay";
import type { UnifiedCalendarItem } from "./types";

const item = (id: string, date: string) => ({ id, date }) as unknown as UnifiedCalendarItem;

describe("filterItemsByDay", () => {
  const items = [
    item("a", new Date(2026, 9, 28, 9).toISOString()),
    item("b", new Date(2026, 9, 28, 17).toISOString()),
    item("c", new Date(2026, 9, 29, 9).toISOString()),
  ];

  it("returns only the items on the given day", () => {
    expect(filterItemsByDay(items, new Date(2026, 9, 28)).map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("returns an empty list when nothing falls on the day", () => {
    expect(filterItemsByDay(items, new Date(2026, 9, 30))).toEqual([]);
  });
});
