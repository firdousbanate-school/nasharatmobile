import { describe, it, expect } from "vitest";
import { groupNotificationsByDay } from "./groupNotificationsByDay";
import type { NotificationRow } from "./types";

function makeRow(id: string, createdAt: string): NotificationRow {
  return {
    id,
    user_id: "u-1",
    school_id: "s-1",
    type: "circular",
    title: "circular_published",
    body: null,
    entity_type: "circular",
    entity_id: "c-1",
    read_at: null,
    created_at: createdAt,
  };
}

describe("groupNotificationsByDay", () => {
  it("separates today notifications from earlier ones", () => {
    const now = new Date("2026-11-15T15:00:00");
    const todayRow = makeRow("n-today", "2026-11-15T08:00:00");
    const earlierRow = makeRow("n-earlier", "2026-11-14T22:00:00");

    const groups = groupNotificationsByDay([todayRow, earlierRow], now);
    expect(groups.today.map((r) => r.id)).toEqual(["n-today"]);
    expect(groups.earlier.map((r) => r.id)).toEqual(["n-earlier"]);
  });
});
