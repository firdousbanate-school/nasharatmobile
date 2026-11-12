import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  profile: vi.fn(),
  assertCan: vi.fn(),
  deleteRecord: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ marker: "supabase" }),
}));
vi.mock("@/lib/auth/getCurrentProfile", () => ({ getCurrentProfile: m.profile }));
vi.mock("./assertCanRegisterAchievement", () => ({ assertCanRegisterAchievement: m.assertCan }));
vi.mock("@/lib/achievements/deleteAchievementRecord", () => ({
  deleteAchievementRecord: m.deleteRecord,
}));

import { deleteAchievementAction } from "./deleteAchievementAction";

describe("deleteAchievementAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "p-1" });
    m.assertCan.mockResolvedValue({ schoolId: "s-1", profileId: "p-1" });
    m.deleteRecord.mockResolvedValue({ error: null });
  });

  it("stops at the permission check", async () => {
    m.assertCan.mockRejectedValue(new Error("Unauthorized"));
    const res = await deleteAchievementAction("a-1");

    expect(res.success).toBe(false);
    expect(m.deleteRecord).not.toHaveBeenCalled();
  });

  it("deletes within the caller's school and refreshes achievements and the dashboard", async () => {
    const res = await deleteAchievementAction("a-1");

    expect(res).toEqual({ success: true });
    expect(m.deleteRecord).toHaveBeenCalledWith({ marker: "supabase" }, "a-1", "s-1");
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/achievements", "page");
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/dashboard", "page");
  });

  it("reports a failed delete without refreshing", async () => {
    m.deleteRecord.mockResolvedValue({ error: { code: "42501", message: "denied" } });
    const res = await deleteAchievementAction("a-1");

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
