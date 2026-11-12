import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const { mockProfile, mockHasPermission, mockFrom, mockDispatch, mockRevalidate } = vi.hoisted(
  () => ({
    mockProfile: vi.fn(),
    mockHasPermission: vi.fn(),
    mockFrom: vi.fn(),
    mockDispatch: vi.fn(),
    mockRevalidate: vi.fn(),
  }),
);

vi.mock("next/cache", () => ({ revalidatePath: mockRevalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/auth/getCurrentProfile", () => ({ getCurrentProfile: mockProfile }));
vi.mock("@/lib/rbac/hasPermission", () => ({ hasPermission: mockHasPermission }));
vi.mock("@/lib/notifications/dispatchModuleNotification", () => ({
  dispatchModuleNotification: mockDispatch,
}));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}));

import { publishCircularAction } from "./publishCircularAction";

function setupTables(updateResult: object = { data: [{ id: "c-1" }] }, targetsResult = {}) {
  const update = createQueryChain(updateResult);
  const targets = createQueryChain({ data: [], ...targetsResult });
  mockFrom.mockImplementation((table: string) =>
    table === "circulars" ? update.chain : targets.chain,
  );
  return { update, targets };
}

describe("publishCircularAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfile.mockResolvedValue({ id: "me", school_id: "school-1" });
    mockHasPermission.mockResolvedValue(true);
  });

  it("requires a profile with a school", async () => {
    mockProfile.mockResolvedValue({ id: "me", school_id: null });
    const res = await publishCircularAction("c-1");
    expect(res.success).toBe(false);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("requires the circular.publish permission for the caller's school", async () => {
    mockHasPermission.mockResolvedValue(false);
    const res = await publishCircularAction("c-1");

    expect(mockHasPermission).toHaveBeenCalledWith("circular.publish", "school-1");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Unauthorized");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("publishes only within the caller's school", async () => {
    const { update } = setupTables();
    const res = await publishCircularAction("c-1");

    expect(res).toEqual({ success: true });
    const updateCall = update.calls.find((c) => c[0] === "update");
    expect(updateCall?.[1]).toMatchObject({ status: "published" });
    expect(update.calls).toContainEqual(["eq", "id", "c-1"]);
    expect(update.calls).toContainEqual(["eq", "school_id", "school-1"]);
    expect(mockRevalidate).toHaveBeenCalledWith("/[locale]/circulars", "page");
  });

  it("notifies department heads except the publisher", async () => {
    setupTables(
      { data: [{ id: "c-1" }] },
      {
        data: [
          { department: { head_profile_id: "head-1" } },
          { department: { head_profile_id: "me" } },
          { department: { head_profile_id: null } },
          { department: null },
        ],
      },
    );
    await publishCircularAction("c-1");

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch.mock.calls[0][0]).toMatchObject({
      recipientUserIds: ["head-1"],
      schoolId: "school-1",
      entityId: "c-1",
    });
  });

  it("does not report success when no circular matched (unknown id or another school)", async () => {
    setupTables({ data: [] });
    const res = await publishCircularAction("c-other");

    expect(res.success).toBe(false);
    expect(res.error).toBe("Circular not found");
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("does not notify anyone when there are no heads", async () => {
    setupTables();
    await publishCircularAction("c-1");
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("returns a failure and sends no notification when the update fails", async () => {
    setupTables({ error: { code: "42501", message: "denied" } });
    const res = await publishCircularAction("c-1");

    expect(res.success).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
});
