import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const m = vi.hoisted(() => ({
  profile: vi.fn(),
  isOwner: vi.fn(),
  assertCanDelete: vi.fn(),
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
vi.mock("./assertCanDeleteRoleRecord", () => ({ assertCanDeleteRoleRecord: m.assertCanDelete }));

import { deleteRoleAction } from "./deleteRoleAction";

describe("deleteRoleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "owner-1", school_id: "s-1" });
    m.isOwner.mockResolvedValue(true);
    m.assertCanDelete.mockResolvedValue({ allowed: true });
  });

  it("requires authentication", async () => {
    m.profile.mockResolvedValue(null);
    const res = await deleteRoleAction("r-1");

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });

  it("only the platform owner may delete roles", async () => {
    m.isOwner.mockResolvedValue(false);
    const res = await deleteRoleAction("r-1");

    expect(res.success).toBe(false);
    expect(res.error).toBe("Only the platform owner can delete roles");
    expect(m.assertCanDelete).not.toHaveBeenCalled();
    expect(m.from).not.toHaveBeenCalled();
  });

  it("refuses to delete a role the safety check blocks (for example one still in use)", async () => {
    m.assertCanDelete.mockResolvedValue({ allowed: false, error: "Role is assigned to users" });
    const res = await deleteRoleAction("r-1");

    expect(res.success).toBe(false);
    expect(res.error).toBe("Role is assigned to users");
    expect(m.from).not.toHaveBeenCalled();
  });

  it("deletes the role and refreshes settings", async () => {
    const del = createQueryChain();
    m.from.mockReturnValue(del.chain);
    const res = await deleteRoleAction("r-1");

    expect(res).toEqual({ success: true });
    expect(m.from).toHaveBeenCalledWith("roles");
    expect(del.calls).toContainEqual(["delete"]);
    expect(del.calls).toContainEqual(["eq", "id", "r-1"]);
    expect(m.revalidate).toHaveBeenCalledWith("users");
  });

  it("reports a failed delete without refreshing", async () => {
    m.from.mockReturnValue(createQueryChain({ error: { code: "23503", message: "fk" } }).chain);
    const res = await deleteRoleAction("r-1");

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
