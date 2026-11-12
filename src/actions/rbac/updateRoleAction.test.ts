import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const m = vi.hoisted(() => ({
  profile: vi.fn(),
  isOwner: vi.fn(),
  assertCanUpdate: vi.fn(),
  syncPermissions: vi.fn(),
  from: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/settings/revalidateSettingsPath", () => ({ revalidateSettingsPath: m.revalidate }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ from: m.from }),
}));
vi.mock("@/lib/auth/getCurrentProfile", () => ({ getCurrentProfile: m.profile }));
vi.mock("@/lib/auth/isPlatformOwner", () => ({ isPlatformOwner: m.isOwner }));
vi.mock("./assertCanUpdateRoleRecord", () => ({ assertCanUpdateRoleRecord: m.assertCanUpdate }));
vi.mock("./syncRolePermissions", () => ({ syncRolePermissions: m.syncPermissions }));

import { updateRoleAction } from "./updateRoleAction";

describe("updateRoleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "owner-1", school_id: "s-1" });
    m.isOwner.mockResolvedValue(true);
    m.assertCanUpdate.mockResolvedValue(undefined);
    m.syncPermissions.mockResolvedValue(undefined);
  });

  it("only the platform owner may change roles and permissions", async () => {
    m.isOwner.mockResolvedValue(false);
    const res = await updateRoleAction("r-1", "Teacher", ["circular.create"]);

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
    expect(m.syncPermissions).not.toHaveBeenCalled();
  });

  it("requires a role name", async () => {
    const res = await updateRoleAction("r-1", "   ", []);

    expect(res.success).toBe(false);
    expect(res.error).toBe("Role name is required");
    expect(m.syncPermissions).not.toHaveBeenCalled();
  });

  it("stops before writing when the role may not be updated", async () => {
    m.assertCanUpdate.mockRejectedValue(new Error("Role not found"));
    const res = await updateRoleAction("r-1", "Teacher", []);

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
    expect(m.syncPermissions).not.toHaveBeenCalled();
  });

  it("renames the role, then syncs its permissions", async () => {
    const update = createQueryChain();
    m.from.mockReturnValue(update.chain);
    const res = await updateRoleAction("r-1", " Teacher ", ["circular.create"]);

    expect(res).toEqual({ success: true });
    expect(m.from).toHaveBeenCalledWith("roles");
    expect(update.calls).toContainEqual(["update", { name: "Teacher" }]);
    expect(update.calls).toContainEqual(["eq", "id", "r-1"]);
    expect(m.syncPermissions.mock.calls[0].slice(1)).toEqual(["r-1", ["circular.create"]]);
    expect(m.revalidate).toHaveBeenCalledWith("users");
  });

  it("does not sync permissions when the rename fails", async () => {
    m.from.mockReturnValue(createQueryChain({ error: { code: "42501", message: "denied" } }).chain);
    const res = await updateRoleAction("r-1", "Teacher", ["x"]);

    expect(res.success).toBe(false);
    expect(m.syncPermissions).not.toHaveBeenCalled();
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
