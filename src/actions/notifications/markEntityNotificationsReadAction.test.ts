import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const m = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({
    auth: { getUser: m.getUser },
    from: m.from,
  }),
}));

import { markEntityNotificationsReadAction } from "./markEntityNotificationsReadAction";

describe("markEntityNotificationsReadAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.getUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
  });

  it("rejects an unknown entity type without querying", async () => {
    const res = await markEntityNotificationsReadAction("profiles" as unknown as "circular", "x-1");

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await markEntityNotificationsReadAction("circular", "c-1");

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });

  it("marks only the caller's unread notifications for the entity and refreshes the badge", async () => {
    const update = createQueryChain({ data: [{ id: "n-1" }, { id: "n-2" }] });
    m.from.mockReturnValue(update.chain);

    const res = await markEntityNotificationsReadAction("circular", "c-1");

    expect(res).toEqual({ success: true, updated: 2 });
    expect(update.calls).toContainEqual(["eq", "user_id", "u-1"]);
    expect(update.calls).toContainEqual(["eq", "entity_type", "circular"]);
    expect(update.calls).toContainEqual(["eq", "entity_id", "c-1"]);
    expect(update.calls).toContainEqual(["is", "read_at", null]);
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]", "layout");
  });

  it("skips revalidation when nothing was unread", async () => {
    m.from.mockReturnValue(createQueryChain({ data: [] }).chain);

    const res = await markEntityNotificationsReadAction("maintenance_request", "m-1");

    expect(res).toEqual({ success: true, updated: 0 });
    expect(m.revalidate).not.toHaveBeenCalled();
  });

  it("reports a database failure", async () => {
    m.from.mockReturnValue(createQueryChain({ error: { code: "42501", message: "denied" } }).chain);

    const res = await markEntityNotificationsReadAction("calendar_event", "e-1");

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
