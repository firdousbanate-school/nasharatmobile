import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  assertCan: vi.fn(),
  validate: vi.fn(),
  assertDept: vi.fn(),
  provision: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/settings/revalidateSettingsPath", () => ({ revalidateSettingsPath: m.revalidate }));
vi.mock("@/lib/school/assertCanManageSchoolUsers", () => ({
  assertCanManageSchoolUsers: m.assertCan,
}));
vi.mock("@/lib/school/assertDepartmentBelongsToSchool", () => ({
  assertDepartmentBelongsToSchool: m.assertDept,
}));
vi.mock("./validateCreateUserInput", () => ({ validateCreateUserInput: m.validate }));
vi.mock("./provisionAuthUser", () => ({ provisionAuthUser: m.provision }));

import { createUserAction } from "./createUserAction";

const input = {
  fullName: " Sara ",
  email: "sara@school.com",
  password: "Str0ngPass!",
  jobTitle: "Teacher",
  departmentId: "d-1",
  roleKey: "",
};

describe("createUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertCan.mockResolvedValue({ schoolId: "s-1", profileId: "admin-1" });
    m.validate.mockReturnValue({
      valid: true,
      trimmedName: "Sara",
      trimmedEmail: "sara@school.com",
    });
    m.assertDept.mockResolvedValue(undefined);
    m.provision.mockResolvedValue({ success: true });
  });

  it("stops at the permission check: nothing is validated or created", async () => {
    m.assertCan.mockRejectedValue(new Error("Unauthorized"));
    const res = await createUserAction(input);

    expect(res.success).toBe(false);
    expect(m.validate).not.toHaveBeenCalled();
    expect(m.provision).not.toHaveBeenCalled();
  });

  it("does not create an account from invalid input", async () => {
    m.validate.mockReturnValue({ valid: false, error: "Password too short" });
    const res = await createUserAction(input);

    expect(res.success).toBe(false);
    expect(res.error).toBe("Password too short");
    expect(m.assertDept).not.toHaveBeenCalled();
    expect(m.provision).not.toHaveBeenCalled();
  });

  it("rejects a department that belongs to another school", async () => {
    m.assertDept.mockRejectedValue(new Error("Department does not belong to this school"));
    const res = await createUserAction(input);

    expect(m.assertDept).toHaveBeenCalledWith("d-1", "s-1");
    expect(res.success).toBe(false);
    expect(m.provision).not.toHaveBeenCalled();
  });

  it("creates the user in the caller's school, defaulting the role to staff", async () => {
    const res = await createUserAction(input);

    expect(res).toEqual({ success: true });
    expect(m.validate).toHaveBeenCalledWith(" Sara ", "sara@school.com", "Str0ngPass!", "staff");
    expect(m.provision.mock.calls[0][0]).toMatchObject({
      fullName: "Sara",
      email: "sara@school.com",
      roleKey: "staff",
      schoolId: "s-1",
      callerId: "admin-1",
      departmentId: "d-1",
    });
    expect(m.revalidate).toHaveBeenCalledWith("users");
  });

  it("keeps an explicitly chosen role", async () => {
    await createUserAction({ ...input, roleKey: "coordinator" });
    expect(m.provision.mock.calls[0][0].roleKey).toBe("coordinator");
  });

  it("reports a failed provisioning without refreshing, and never echoes the password", async () => {
    m.provision.mockResolvedValue({ success: false, error: { code: "23505", message: "dup" } });
    const res = await createUserAction(input);

    expect(res.success).toBe(false);
    expect(JSON.stringify(res)).not.toContain("Str0ngPass!");
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
