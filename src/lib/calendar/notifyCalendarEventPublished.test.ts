import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const m = vi.hoisted(() => ({
  adminFrom: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: vi.fn(() => ({ from: m.adminFrom })),
}));
vi.mock("@/lib/notifications/dispatchModuleNotification", () => ({
  dispatchModuleNotification: m.dispatch,
}));

import { notifyCalendarEventPublished } from "./notifyCalendarEventPublished";

describe("notifyCalendarEventPublished", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.dispatch.mockResolvedValue({ delivered: 2 });
  });

  it("notifies active school members excluding the publisher with the event title", async () => {
    const profiles = createQueryChain({
      data: [{ id: "staff-1" }, { id: "staff-2" }, { id: "pub-1" }],
    });
    m.adminFrom.mockReturnValue(profiles.chain);

    await notifyCalendarEventPublished({
      eventId: "ev-1",
      schoolId: "school-1",
      publisherId: "pub-1",
      title: "Parent-Teacher Conference",
    });

    expect(profiles.calls).toContainEqual(["eq", "school_id", "school-1"]);
    expect(profiles.calls).toContainEqual(["eq", "is_active", true]);
    expect(m.dispatch).toHaveBeenCalledTimes(1);
    expect(m.dispatch.mock.calls[0][0]).toEqual({
      recipientUserIds: ["staff-1", "staff-2"],
      schoolId: "school-1",
      type: "calendar",
      title: "calendar_published",
      body: JSON.stringify({ title: "Parent-Teacher Conference" }),
      entityType: "calendar_event",
      entityId: "ev-1",
    });
  });
});
