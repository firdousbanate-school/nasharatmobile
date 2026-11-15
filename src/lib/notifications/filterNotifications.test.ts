import { describe, it, expect } from "vitest";
import { filterNotifications } from "./filterNotifications";
import type { NotificationRow } from "./types";

const baseRows: NotificationRow[] = [
  {
    id: "n-1",
    user_id: "u-1",
    school_id: "s-1",
    type: "circular",
    title: "circular_published",
    body: null,
    entity_type: "circular",
    entity_id: "c-1",
    read_at: null,
    created_at: "2026-11-14T10:00:00Z",
  },
  {
    id: "n-2",
    user_id: "u-1",
    school_id: "s-1",
    type: "maintenance",
    title: "maintenance_created",
    body: null,
    entity_type: "maintenance_request",
    entity_id: "m-1",
    read_at: "2026-11-14T11:00:00Z",
    created_at: "2026-11-14T10:30:00Z",
  },
];

describe("filterNotifications", () => {
  it("returns all notifications when filter is all", () => {
    expect(filterNotifications(baseRows, "all")).toHaveLength(2);
  });

  it("filters unread notifications", () => {
    const res = filterNotifications(baseRows, "unread");
    expect(res).toHaveLength(1);
    expect(res[0]?.id).toBe("n-1");
  });

  it("filters by module type", () => {
    const res = filterNotifications(baseRows, "maintenance");
    expect(res).toHaveLength(1);
    expect(res[0]?.id).toBe("n-2");
  });
});
