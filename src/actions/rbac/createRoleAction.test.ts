import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  profile: vi.fn(),
  isOwner: vi.fn(),
  firstSchool: vi.fn(),
  insertRow: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/settings/revalidateSettingsPath", () => ({ revalidateSettingsPath: m.revalidate }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ marker: "supabase" }),
}));
vi.mock("@/lib/auth/getCurrentProfile", () => ({ getCurrentProfile: m.profile }));
vi.mock("@/lib/auth/isPlatformOwner", () => ({ isPlatformOwner: m.isOwner }));
vi.mock("@/lib/school/getFirstActiveSchoolId", () => ({ getFirstActiveSchoolId: m.firstSchool }));
vi.mock("./insertRoleRow", () => ({ insertRoleRow: m.insertRow }));

import { createRoleAction } from "./createRoleAction";

describe("createRoleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "owner-1", school_id: "s-1" });
    m.isOwner.mockResolvedValue(true);
    m.insertRow.mockResolvedValue({ success: true });
  });

  it("requires authentication", async () => {
    m.profile.mockResolvedValue(null);
    const res = await createRoleAction("Teacher", "teacher", []);

    expect(res.success).toBe(false);
    expect(m.insertRow).not.toHaveBeenCalled();
  });

  it("only the platform owner may create roles", async () => {
    m.isOwner.mockResolvedValue(false);
    const res = await createRoleAction("Teacher", "teacher", ["circular.create"]);

    expect(res.success).toBe(false);
    expect(res.error).toBe("Only the platform owner can create roles");
    expect(m.insertRow).not.toHaveBeenCalled();
  });

  it("refuses the reserved owner keys", async () => {
    for (const key of ["owner", "platform_owner", " OWNER "]) {
      const res = await createRoleAction("Boss", key, []);
      expect(res.success).toBe(false);
    }
    expect(m.insertRow).not.toHaveBeenCalled();
  });

  it("requires a name and a key", async () => {
    expect((await createRoleAction("  ", "k", [])).success).toBe(false);
    expect((await createRoleAction("Name", "   ", [])).success).toBe(false);
    expect(m.insertRow).not.toHaveBeenCalled();
  });

  it("creates the role in the caller's school with a normalized key", async () => {
    const res = await createRoleAction("  Head Teacher ", " Head Teacher!", ["circular.create"]);

    expect(res).toEqual({ success: true });
    expect(m.insertRow.mock.calls[0][1]).toEqual({
      name: "Head Teacher",
      key: "head_teacher_",
      schoolId: "s-1",
      permissionKeys: ["circular.create"],
    });
    expect(m.revalidate).toHaveBeenCalledWith("users");
  });

  it("falls back to the first active school for an owner without a school", async () => {
    m.profile.mockResolvedValue({ id: "owner-1", school_id: null });
    m.firstSchool.mockResolvedValue("s-first");
    await createRoleAction("Teacher", "teacher", []);

    expect(m.insertRow.mock.calls[0][1].schoolId).toBe("s-first");
  });

  it("fails when there is no school at all", async () => {
    m.profile.mockResolvedValue({ id: "owner-1", school_id: null });
    m.firstSchool.mockResolvedValue(null);
    const res = await createRoleAction("Teacher", "teacher", []);

    expect(res.success).toBe(false);
    expect(m.insertRow).not.toHaveBeenCalled();
  });

  it("reports a failed insert without refreshing", async () => {
    m.insertRow.mockResolvedValue({ success: false, error: { code: "23505", message: "dup" } });
    const res = await createRoleAction("Teacher", "teacher", []);

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
