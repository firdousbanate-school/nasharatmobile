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

import { createDepartmentAction } from "./createDepartmentAction";
import { createLocationAction } from "./createLocationAction";
import { deleteLocationAction } from "./deleteLocationAction";
import { toggleDepartmentStatusAction } from "./toggleDepartmentStatusAction";
import { toggleLocationStatusAction } from "./toggleLocationStatusAction";
import { updateDepartmentAction } from "./updateDepartmentAction";
import { updateLocationAction } from "./updateLocationAction";

const departmentForm = () => {
  const f = new FormData();
  f.set("name_ar", " قسم العلوم ");
  f.set("name_en", " Science ");
  return f;
};
const locationForm = () => {
  const f = new FormData();
  f.set("building", " Main ");
  f.set("floor", "2");
  f.set("room", "201");
  f.set("kind", "room");
  return f;
};

// Every write needs a profile with a school and settings.school.update for that school.
const writeActions = [
  ["createDepartmentAction", () => createDepartmentAction(departmentForm())],
  ["updateDepartmentAction", () => updateDepartmentAction("x-1", "قسم", "Dept")],
  ["toggleDepartmentStatusAction", () => toggleDepartmentStatusAction("x-1", true)],
  ["createLocationAction", () => createLocationAction(locationForm())],
  ["updateLocationAction", () => updateLocationAction("x-1", "Main", "1", "101", "room")],
  ["toggleLocationStatusAction", () => toggleLocationStatusAction("x-1", true)],
  ["deleteLocationAction", () => deleteLocationAction("x-1")],
] as const;

describe.each(writeActions)("%s access control", (_name, run) => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "p-1", school_id: "s-1" });
    m.hasPermission.mockResolvedValue(true);
  });

  it("requires a profile with a school", async () => {
    m.profile.mockResolvedValue({ id: "p-1", school_id: null });
    const res = await run();

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });

  it("requires settings.school.update for the caller's school", async () => {
    m.hasPermission.mockResolvedValue(false);
    const res = await run();

    expect(m.hasPermission).toHaveBeenCalledWith("settings.school.update", "s-1");
    expect(res.error).toBe("Unauthorized");
    expect(m.from).not.toHaveBeenCalled();
    expect(m.revalidateSettings).not.toHaveBeenCalled();
  });
});

describe("scoped updates and toggles", () => {
  const updates = [
    ["updateDepartmentAction", () => updateDepartmentAction("x-1", "قسم", "Dept"), "departments"],
    [
      "toggleDepartmentStatusAction",
      () => toggleDepartmentStatusAction("x-1", true),
      "departments",
    ],
    [
      "updateLocationAction",
      () => updateLocationAction("x-1", "Main", "1", "101", "room"),
      "locations",
    ],
    ["toggleLocationStatusAction", () => toggleLocationStatusAction("x-1", true), "locations"],
  ] as const;

  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "p-1", school_id: "s-1" });
    m.hasPermission.mockResolvedValue(true);
  });

  it.each(updates)("%s changes only a row of the caller's school", async (_n, run, table) => {
    const chain = createQueryChain({ data: [{ id: "x-1" }] });
    m.from.mockReturnValue(chain.chain);
    const res = await run();

    expect(res).toEqual({ success: true });
    expect(m.from).toHaveBeenCalledWith(table);
    expect(chain.calls).toContainEqual(["eq", "id", "x-1"]);
    expect(chain.calls).toContainEqual(["eq", "school_id", "s-1"]);
    expect(m.revalidateSettings).toHaveBeenCalledWith(table);
  });

  it.each(updates)("%s does not report success when no row matched", async (_n, run) => {
    m.from.mockReturnValue(createQueryChain({ data: [] }).chain);
    const res = await run();

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/not found/i);
    expect(m.revalidateSettings).not.toHaveBeenCalled();
  });

  it.each(updates)("%s reports a database failure", async (_n, run) => {
    m.from.mockReturnValue(createQueryChain({ error: { code: "42501", message: "denied" } }).chain);
    const res = await run();

    expect(res.success).toBe(false);
    expect(m.revalidateSettings).not.toHaveBeenCalled();
  });

  it("toggle flips the current status", async () => {
    const on = createQueryChain({ data: [{ id: "x-1" }] });
    m.from.mockReturnValue(on.chain);
    await toggleDepartmentStatusAction("x-1", true);
    expect(on.calls).toContainEqual(["update", { is_active: false }]);

    const off = createQueryChain({ data: [{ id: "x-1" }] });
    m.from.mockReturnValue(off.chain);
    await toggleLocationStatusAction("x-1", false);
    expect(off.calls).toContainEqual(["update", { is_active: true }]);
  });
});

describe("create actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "p-1", school_id: "s-1" });
    m.hasPermission.mockResolvedValue(true);
  });

  it("createDepartmentAction inserts trimmed names into the caller's school", async () => {
    const chain = createQueryChain();
    m.from.mockReturnValue(chain.chain);
    const res = await createDepartmentAction(departmentForm());

    expect(res).toEqual({ success: true });
    expect(chain.calls).toContainEqual([
      "insert",
      { school_id: "s-1", name_ar: "قسم العلوم", name_en: "Science" },
    ]);
    expect(m.revalidateSettings).toHaveBeenCalledWith("departments");
  });

  it("createDepartmentAction rejects missing names before inserting", async () => {
    const form = new FormData();
    form.set("name_ar", "   ");
    form.set("name_en", "Science");
    const res = await createDepartmentAction(form);

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });

  it("createLocationAction inserts into the caller's school and requires a building", async () => {
    const chain = createQueryChain();
    m.from.mockReturnValue(chain.chain);
    const res = await createLocationAction(locationForm());

    expect(res).toEqual({ success: true });
    const insert = chain.calls.find((c) => c[0] === "insert");
    expect(insert?.[1]).toMatchObject({ school_id: "s-1", building: "Main", room: "201" });

    m.from.mockClear();
    const empty = new FormData();
    empty.set("building", "  ");
    expect((await createLocationAction(empty)).success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });
});

describe("deleteLocationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "p-1", school_id: "s-1" });
    m.hasPermission.mockResolvedValue(true);
  });

  it("deletes only a location of the caller's school", async () => {
    const chain = createQueryChain({ count: 1 });
    m.from.mockReturnValue(chain.chain);
    const res = await deleteLocationAction("l-1");

    expect(res).toEqual({ success: true });
    expect(chain.calls).toContainEqual(["eq", "id", "l-1"]);
    expect(chain.calls).toContainEqual(["eq", "school_id", "s-1"]);
    expect(m.revalidateSettings).toHaveBeenCalledWith("locations");
  });

  it("explains that a location with maintenance requests must be deactivated instead", async () => {
    m.from.mockReturnValue(createQueryChain({ error: { code: "23503", message: "fk" } }).chain);
    const res = await deleteLocationAction("l-1");

    expect(res.success).toBe(false);
    expect(res.error).toContain("Deactivate it instead");
  });

  it("does not report success when nothing was deleted", async () => {
    m.from.mockReturnValue(createQueryChain({ count: 0 }).chain);
    const res = await deleteLocationAction("l-other");

    expect(res.success).toBe(false);
    expect(m.revalidateSettings).not.toHaveBeenCalled();
  });
});
