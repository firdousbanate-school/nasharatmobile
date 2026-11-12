import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  profile: vi.fn(),
  parse: vi.fn(),
  assertCan: vi.fn(),
  upload: vi.fn(),
  updateRecord: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ marker: "supabase" }),
}));
vi.mock("@/lib/auth/getCurrentProfile", () => ({ getCurrentProfile: m.profile }));
vi.mock("@/lib/validation/parseAchievementFormData", () => ({
  parseAchievementFormData: m.parse,
}));
vi.mock("./assertCanRegisterAchievement", () => ({ assertCanRegisterAchievement: m.assertCan }));
vi.mock("@/lib/calendar/uploadCalendarImage", () => ({ uploadCalendarImage: m.upload }));
vi.mock("@/lib/achievements/updateAchievementRecord", () => ({
  updateAchievementRecord: m.updateRecord,
}));

import { updateAchievementAction } from "./updateAchievementAction";

const form = new FormData();
const data = {
  departmentId: "d-1",
  titleAr: "إنجاز",
  titleEn: null,
  description: null,
  category: "academic",
  dateAchieved: "2026-10-01",
  visibility: "public",
  image: null as File | null,
};

describe("updateAchievementAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "p-1" });
    m.parse.mockReturnValue(data);
    m.assertCan.mockResolvedValue({ schoolId: "s-1", profileId: "p-1" });
    m.upload.mockResolvedValue({ path: "s-1/achievements/new.png" });
    m.updateRecord.mockResolvedValue({ success: true });
  });

  it("checks the right to register an achievement for that department", async () => {
    m.assertCan.mockRejectedValue(new Error("Unauthorized"));
    const res = await updateAchievementAction("a-1", form);

    expect(m.assertCan).toHaveBeenCalledWith({ id: "p-1" }, "d-1");
    expect(res.success).toBe(false);
    expect(m.updateRecord).not.toHaveBeenCalled();
  });

  it("requires the Arabic title", async () => {
    m.parse.mockReturnValue({ ...data, titleAr: "" });
    const res = await updateAchievementAction("a-1", form);

    expect(res.error).toBe("Achievement title in Arabic is required");
    expect(m.updateRecord).not.toHaveBeenCalled();
  });

  it("updates within the caller's school and leaves the image alone when none is uploaded", async () => {
    const res = await updateAchievementAction("a-1", form);

    expect(res).toEqual({ success: true });
    expect(m.upload).not.toHaveBeenCalled();
    const input = m.updateRecord.mock.calls[0][1];
    expect(input).toMatchObject({ id: "a-1", schoolId: "s-1", departmentId: "d-1" });
    expect(input.imagePath).toBeUndefined();
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/achievements", "page");
  });

  it("uploads a new image into the caller's school folder", async () => {
    const image = new File(["x"], "new.png", { type: "image/png" });
    m.parse.mockReturnValue({ ...data, image });
    await updateAchievementAction("a-1", form);

    expect(m.upload).toHaveBeenCalledWith({ marker: "supabase" }, image, "s-1", "achievements");
    expect(m.updateRecord.mock.calls[0][1].imagePath).toBe("s-1/achievements/new.png");
  });

  it("does not update when the image upload fails", async () => {
    m.parse.mockReturnValue({ ...data, image: new File(["x"], "new.png") });
    m.upload.mockResolvedValue({ error: { code: "XX000", message: "storage down" } });
    const res = await updateAchievementAction("a-1", form);

    expect(res.success).toBe(false);
    expect(m.updateRecord).not.toHaveBeenCalled();
  });

  it("reports an update that matched nothing without refreshing", async () => {
    m.updateRecord.mockResolvedValue({ success: false, error: "Achievement not found" });
    const res = await updateAchievementAction("a-other", form);

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
