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

import { markNotificationUnreadAction } from "./markNotificationUnreadAction";
import { deleteNotificationAction } from "./deleteNotificationAction";

describe("notification manage actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.getUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
  });

  it("marks only the caller's notification as unread", async () => {
    const update = createQueryChain();
    m.from.mockReturnValue(update.chain);

    const res = await markNotificationUnreadAction("n-1");

    expect(res).toEqual({ success: true });
    expect(update.calls).toContainEqual(["update", { read_at: null }]);
    expect(update.calls).toContainEqual(["eq", "id", "n-1"]);
    expect(update.calls).toContainEqual(["eq", "user_id", "u-1"]);
  });

  it("deletes only the caller's notification", async () => {
    const del = createQueryChain();
    m.from.mockReturnValue(del.chain);

    const res = await deleteNotificationAction("n-1");

    expect(res).toEqual({ success: true });
    expect(del.calls).toContainEqual(["delete"]);
    expect(del.calls).toContainEqual(["eq", "id", "n-1"]);
    expect(del.calls).toContainEqual(["eq", "user_id", "u-1"]);
  });
});
