import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const m = vi.hoisted(() => ({
  assertCan: vi.fn(),
  from: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/calendar/assertCanManageCalendar", () => ({ assertCanManageCalendar: m.assertCan }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ from: m.from }),
}));

import { archiveCalendarEventAction } from "./archiveCalendarEventAction";
import { cancelCalendarEventAction } from "./cancelCalendarEventAction";
import { publishCalendarEventAction } from "./publishCalendarEventAction";

const cases = [
  { name: "archive", run: archiveCalendarEventAction, status: "archived" },
  { name: "cancel", run: cancelCalendarEventAction, status: "cancelled" },
  { name: "publish", run: publishCalendarEventAction, status: "published" },
] as const;

describe.each(cases)("$name calendar event action", ({ run, status }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertCan.mockResolvedValue({ schoolId: "s-1" });
  });

  it("stops at the permission check without touching the database", async () => {
    m.assertCan.mockRejectedValue(new Error("Unauthorized"));
    const res = await run("e-1");

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
    expect(m.revalidate).not.toHaveBeenCalled();
  });

  it(`sets the status to ${status} only for an event of the caller's school`, async () => {
    const update = createQueryChain({ data: [{ id: "e-1" }] });
    m.from.mockReturnValue(update.chain);
    const res = await run("e-1");

    expect(res).toEqual({ success: true });
    expect(m.from).toHaveBeenCalledWith("calendar_events");
    const updateCall = update.calls.find((c) => c[0] === "update");
    expect(updateCall?.[1]).toMatchObject({ status });
    expect(update.calls).toContainEqual(["eq", "id", "e-1"]);
    expect(update.calls).toContainEqual(["eq", "school_id", "s-1"]);
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/calendar", "page");
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/calendar/e-1", "page");
  });

  it("does not report success when no event matched (unknown id or another school)", async () => {
    m.from.mockReturnValue(createQueryChain({ data: [] }).chain);
    const res = await run("e-other");

    expect(res.success).toBe(false);
    expect(res.error).toBe("Event not found");
    expect(m.revalidate).not.toHaveBeenCalled();
  });

  it("reports a database failure without refreshing", async () => {
    m.from.mockReturnValue(createQueryChain({ error: { code: "42501", message: "denied" } }).chain);
    const res = await run("e-1");

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
