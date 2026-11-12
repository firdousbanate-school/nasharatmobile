import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  assertCan: vi.fn(),
  validate: vi.fn(),
  assertDept: vi.fn(),
  persist: vi.fn(),
  applyRole: vi.fn(),
  audit: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/settings/revalidateSettingsPath", () => ({ revalidateSettingsPath: m.revalidate }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: vi.fn().mockReturnValue({ marker: "admin" }),
}));
vi.mock("@/lib/school/assertCanManageUser", () => ({ assertCanManageUser: m.assertCan }));
vi.mock("@/lib/school/validateUserUpdateInput", () => ({ validateUserUpdateInput: m.validate }));
vi.mock("@/lib/school/assertDepartmentBelongsToSchool", () => ({
  assertDepartmentBelongsToSchool: m.assertDept,
}));
vi.mock("@/lib/school/persistUserUpdates", () => ({ persistUserUpdates: m.persist }));
vi.mock("@/lib/school/applyUserRoleUpdate", () => ({ applyUserRoleUpdate: m.applyRole }));
vi.mock("@/lib/audit/recordCredentialAudit", () => ({ recordCredentialAudit: m.audit }));

import { updateUserAction } from "./updateUserAction";

const input = {
  userId: "u-2",
  fullName: "Sara",
  roleKey: "staff",
  departmentId: "d-1",
  isActive: true,
} as Parameters<typeof updateUserAction>[0];

describe("updateUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertCan.mockResolvedValue({ allowed: true, schoolId: "s-1", currentUserId: "admin-1" });
    m.validate.mockReturnValue({ valid: true });
    m.assertDept.mockResolvedValue(undefined);
    m.persist.mockResolvedValue({ success: true });
    m.applyRole.mockResolvedValue(undefined);
  });

  it("refuses when the caller may not manage this user", async () => {
    m.assertCan.mockResolvedValue({ allowed: false, error: "Cannot manage this user" });
    const res = await updateUserAction(input);

    expect(m.assertCan).toHaveBeenCalledWith("u-2", "staff");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Cannot manage this user");
    expect(m.persist).not.toHaveBeenCalled();
    expect(m.applyRole).not.toHaveBeenCalled();
  });

  it("refuses when the caller's school or identity is unknown", async () => {
    m.assertCan.mockResolvedValue({ allowed: true, schoolId: null, currentUserId: "admin-1" });
    const res = await updateUserAction(input);

    expect(res.success).toBe(false);
    expect(m.persist).not.toHaveBeenCalled();
  });

  it("rejects invalid input before writing", async () => {
    m.validate.mockReturnValue({ valid: false, error: "Name is required" });
    const res = await updateUserAction(input);

    expect(res.error).toBe("Name is required");
    expect(m.persist).not.toHaveBeenCalled();
  });

  it("rejects a department from another school before writing", async () => {
    m.assertDept.mockRejectedValue(new Error("Department does not belong to this school"));
    const res = await updateUserAction(input);

    expect(m.assertDept).toHaveBeenCalledWith("d-1", "s-1");
    expect(res.success).toBe(false);
    expect(m.persist).not.toHaveBeenCalled();
  });

  it("updates within the caller's school then applies the role, without a credential audit", async () => {
    const res = await updateUserAction(input);

    expect(res).toEqual({ success: true });
    expect(m.persist.mock.calls[0].slice(0, 2)).toEqual([{ marker: "admin" }, "s-1"]);
    expect(m.applyRole).toHaveBeenCalledWith("u-2", "s-1", "admin-1", "staff", "d-1");
    expect(m.audit).not.toHaveBeenCalled();
    expect(m.revalidate).toHaveBeenCalledWith("users");
  });

  it("records a credential audit entry when the password is reset", async () => {
    await updateUserAction({ ...input, password: "NewStr0ng!" } as typeof input);

    expect(m.audit).toHaveBeenCalledWith({
      schoolId: "s-1",
      actorId: "admin-1",
      action: "credentials.password_reset",
      entityId: "u-2",
    });
  });

  it("does not change the role when persisting the update fails", async () => {
    m.persist.mockResolvedValue({ success: false, error: { code: "42501", message: "denied" } });
    const res = await updateUserAction(input);

    expect(res.success).toBe(false);
    expect(m.applyRole).not.toHaveBeenCalled();
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
