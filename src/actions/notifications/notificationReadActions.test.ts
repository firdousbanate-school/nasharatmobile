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

import { markAllNotificationsReadAction } from "./markAllNotificationsReadAction";
import { markNotificationReadAction } from "./markNotificationReadAction";

describe("markNotificationReadAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.getUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
  });

  it("requires a notification id", async () => {
    const res = await markNotificationReadAction("");

    expect(res.error).toBe("Notification ID is required");
    expect(m.from).not.toHaveBeenCalled();
  });

  it("requires a signed-in user", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await markNotificationReadAction("n-1");

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });

  it("marks only the caller's own notification as read", async () => {
    const update = createQueryChain();
    m.from.mockReturnValue(update.chain);
    const res = await markNotificationReadAction("n-1");

    expect(res).toEqual({ success: true });
    expect(m.from).toHaveBeenCalledWith("notifications");
    expect(update.calls).toContainEqual(["eq", "id", "n-1"]);
    expect(update.calls).toContainEqual(["eq", "user_id", "u-1"]);
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/notifications", "page");
  });

  it("reports a database failure without refreshing", async () => {
    m.from.mockReturnValue(createQueryChain({ error: { code: "42501", message: "denied" } }).chain);
    const res = await markNotificationReadAction("n-1");

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});

describe("markAllNotificationsReadAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.getUser.mockResolvedValue({ data: { user: { id: "u-1" } }, error: null });
  });

  it("requires a signed-in user", async () => {
    m.getUser.mockResolvedValue({ data: { user: null }, error: { message: "no session" } });
    const res = await markAllNotificationsReadAction();

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });

  it("marks only the caller's own unread notifications as read", async () => {
    const update = createQueryChain();
    m.from.mockReturnValue(update.chain);
    const res = await markAllNotificationsReadAction();

    expect(res).toEqual({ success: true });
    expect(update.calls).toContainEqual(["eq", "user_id", "u-1"]);
    expect(update.calls).toContainEqual(["is", "read_at", null]);
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/notifications", "page");
  });
});
