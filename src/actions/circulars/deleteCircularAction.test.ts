import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockAssert, mockCreateClient, mockDeleteRecord, mockRevalidate } = vi.hoisted(() => ({
  mockAssert: vi.fn(),
  mockCreateClient: vi.fn(),
  mockDeleteRecord: vi.fn(),
  mockRevalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mockRevalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ createSupabaseServerClient: mockCreateClient }));
vi.mock("@/lib/circulars/assertCanManageCirculars", () => ({
  assertCanManageCirculars: mockAssert,
}));
vi.mock("@/lib/circulars/deleteCircularRecord", () => ({
  deleteCircularRecord: mockDeleteRecord,
}));

import { deleteCircularAction } from "./deleteCircularAction";

describe("deleteCircularAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue({ marker: "supabase" });
  });

  it("does nothing when the caller may not manage circulars", async () => {
    mockAssert.mockResolvedValue({ authorized: false, error: "Unauthorized" });

    const res = await deleteCircularAction("c-1");

    expect(res.success).toBe(false);
    expect(res.error).toBe("Unauthorized");
    expect(mockCreateClient).not.toHaveBeenCalled();
    expect(mockDeleteRecord).not.toHaveBeenCalled();
    expect(mockRevalidate).not.toHaveBeenCalled();
  });

  it("deletes the circular and refreshes the list when authorized", async () => {
    mockAssert.mockResolvedValue({ authorized: true, profileId: "p-1", schoolId: "s-1" });
    mockDeleteRecord.mockResolvedValue({ success: true });

    const res = await deleteCircularAction("c-1");

    expect(res).toEqual({ success: true });
    expect(mockDeleteRecord).toHaveBeenCalledWith({ marker: "supabase" }, "c-1");
    expect(mockRevalidate).toHaveBeenCalledWith("/[locale]/circulars", "page");
  });

  it("reports a failed delete without refreshing the list", async () => {
    mockAssert.mockResolvedValue({ authorized: true, profileId: "p-1", schoolId: "s-1" });
    mockDeleteRecord.mockResolvedValue({ success: false, error: "Circular not found" });

    const res = await deleteCircularAction("c-404");

    expect(res.success).toBe(false);
    expect(mockRevalidate).not.toHaveBeenCalled();
  });
});
