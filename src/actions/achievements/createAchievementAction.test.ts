import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  profile: vi.fn(),
  parse: vi.fn(),
  assertCan: vi.fn(),
  upload: vi.fn(),
  createRecord: vi.fn(),
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
vi.mock("@/lib/achievements/createAchievementRecord", () => ({
  createAchievementRecord: m.createRecord,
}));

import { createAchievementAction } from "./createAchievementAction";

const form = new FormData();
const data = {
  departmentId: "d-1",
  titleAr: "إنجاز",
  titleEn: "Achievement",
  description: "text",
  category: "academic",
  dateAchieved: "2026-10-01",
  visibility: "public",
  image: null as File | null,
};

describe("createAchievementAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.profile.mockResolvedValue({ id: "p-1" });
    m.parse.mockReturnValue(data);
    m.assertCan.mockResolvedValue({ schoolId: "s-1", profileId: "p-1" });
    m.upload.mockResolvedValue({ path: "s-1/achievements/img.png" });
    m.createRecord.mockResolvedValue({ id: "a-1" });
  });

  it("checks the right to register an achievement for that department", async () => {
    m.assertCan.mockRejectedValue(new Error("Unauthorized"));
    const res = await createAchievementAction(form);

    expect(m.assertCan).toHaveBeenCalledWith({ id: "p-1" }, "d-1");
    expect(res.success).toBe(false);
    expect(m.createRecord).not.toHaveBeenCalled();
  });

  it("requires the Arabic title", async () => {
    m.parse.mockReturnValue({ ...data, titleAr: "" });
    const res = await createAchievementAction(form);

    expect(res.error).toBe("Achievement title in Arabic is required");
    expect(m.createRecord).not.toHaveBeenCalled();
  });

  it("creates the record for the caller's school without an upload when there is no image", async () => {
    const res = await createAchievementAction(form);

    expect(res).toEqual({ success: true, achievementId: "a-1" });
    expect(m.upload).not.toHaveBeenCalled();
    expect(m.createRecord.mock.calls[0][1]).toMatchObject({
      schoolId: "s-1",
      departmentId: "d-1",
      createdBy: "p-1",
      imagePath: null,
    });
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/achievements", "page");
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/dashboard", "page");
  });

  it("uploads the image into the caller's school folder and stores its path", async () => {
    const image = new File(["x"], "img.png", { type: "image/png" });
    m.parse.mockReturnValue({ ...data, image });
    await createAchievementAction(form);

    expect(m.upload).toHaveBeenCalledWith({ marker: "supabase" }, image, "s-1", "achievements");
    expect(m.createRecord.mock.calls[0][1].imagePath).toBe("s-1/achievements/img.png");
  });

  it("does not create the record when the image upload fails", async () => {
    m.parse.mockReturnValue({ ...data, image: new File(["x"], "img.png") });
    m.upload.mockResolvedValue({ error: { code: "XX000", message: "storage down" } });
    const res = await createAchievementAction(form);

    expect(res.success).toBe(false);
    expect(m.createRecord).not.toHaveBeenCalled();
    expect(m.revalidate).not.toHaveBeenCalled();
  });

  it("reports a failed insert without refreshing", async () => {
    m.createRecord.mockResolvedValue({ error: { code: "23503", message: "fk" } });
    const res = await createAchievementAction(form);

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
