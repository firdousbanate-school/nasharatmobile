import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const m = vi.hoisted(() => ({
  profile: vi.fn(),
  hasPermission: vi.fn(),
  from: vi.fn(),
  revalidateSettings: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidatePath }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/settings/revalidateSettingsPath", () => ({
  revalidateSettingsPath: m.revalidateSettings,
}));
vi.mock("@/lib/auth/getCurrentProfile", () => ({ getCurrentProfile: m.profile }));
vi.mock("@/lib/rbac/hasPermission", () => ({ hasPermission: m.hasPermission }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ from: m.from }),
}));

import { deleteDepartmentAction } from "./deleteDepartmentAction";

describe("deleteDepartmentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "p-1", school_id: "s-1" });
    m.hasPermission.mockResolvedValue(true);
  });

  it("requires a profile with a school", async () => {
    m.profile.mockResolvedValue({ id: "p-1", school_id: null });
    const res = await deleteDepartmentAction("d-1");

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });

  it("requires settings.school.update for the caller's school", async () => {
    m.hasPermission.mockResolvedValue(false);
    const res = await deleteDepartmentAction("d-1");

    expect(m.hasPermission).toHaveBeenCalledWith("settings.school.update", "s-1");
    expect(res.error).toBe("Unauthorized");
    expect(m.from).not.toHaveBeenCalled();
  });

  it("deletes only a department of the caller's school and refreshes the pages", async () => {
    const del = createQueryChain({ count: 1 });
    m.from.mockReturnValue(del.chain);
    const res = await deleteDepartmentAction("d-1");

    expect(res).toEqual({ success: true });
    expect(m.from).toHaveBeenCalledWith("departments");
    expect(del.calls).toContainEqual(["eq", "id", "d-1"]);
    expect(del.calls).toContainEqual(["eq", "school_id", "s-1"]);
    expect(m.revalidateSettings).toHaveBeenCalledWith("departments");
    expect(m.revalidatePath).toHaveBeenCalled();
  });

  it("explains that a department still in use must be deactivated instead", async () => {
    m.from.mockReturnValue(createQueryChain({ error: { code: "23503", message: "fk" } }).chain);
    const res = await deleteDepartmentAction("d-1");

    expect(res.success).toBe(false);
    expect(res.error).toContain("Deactivate it instead");
    expect(m.revalidateSettings).not.toHaveBeenCalled();
  });

  it("does not report success when nothing was deleted (wrong id or other school)", async () => {
    m.from.mockReturnValue(createQueryChain({ count: 0 }).chain);
    const res = await deleteDepartmentAction("d-other");

    expect(res.success).toBe(false);
    expect(m.revalidateSettings).not.toHaveBeenCalled();
  });
});
