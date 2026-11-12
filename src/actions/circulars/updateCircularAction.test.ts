import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  assertCan: vi.fn(),
  parse: vi.fn(),
  assertDocs: vi.fn(),
  updateRecord: vi.fn(),
  upload: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/lib/circulars/assertCanManageCirculars", () => ({
  assertCanManageCirculars: m.assertCan,
}));
vi.mock("@/lib/validation/parseCircularFormData", () => ({ parseCircularFormData: m.parse }));
vi.mock("@/lib/circulars/assertValidCircularDocuments", () => ({
  assertValidCircularDocuments: m.assertDocs,
}));
vi.mock("@/lib/circulars/updateCircularRecord", () => ({ updateCircularRecord: m.updateRecord }));
vi.mock("@/lib/circulars/handleCircularDocumentsUpload", () => ({
  handleCircularDocumentsUpload: m.upload,
}));

import { updateCircularAction } from "./updateCircularAction";

const form = new FormData();
const parsed = {
  title: "Updated",
  body: "Body",
  priority: "high",
  visibility: "internal",
  responseType: "none",
  dueAt: null,
  publishAt: null,
  status: "draft",
  departmentIds: ["d-1"],
};

describe("updateCircularAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertCan.mockResolvedValue({ authorized: true, profileId: "p-1", schoolId: "s-1" });
    m.parse.mockReturnValue(parsed);
    m.assertDocs.mockResolvedValue(undefined);
    m.updateRecord.mockResolvedValue({ success: true });
    m.upload.mockResolvedValue({ error: null });
  });

  it("refuses unauthorized callers before parsing or writing", async () => {
    m.assertCan.mockResolvedValue({ authorized: false, error: "Unauthorized" });
    const res = await updateCircularAction("c-1", form);

    expect(res.success).toBe(false);
    expect(res.error).toBe("Unauthorized");
    expect(m.updateRecord).not.toHaveBeenCalled();
  });

  it("requires a title and a body", async () => {
    m.parse.mockReturnValue({ ...parsed, body: "" });
    const res = await updateCircularAction("c-1", form);

    expect(res.success).toBe(false);
    expect(m.updateRecord).not.toHaveBeenCalled();
  });

  it("updates the circular scoped to the caller's school and refreshes both pages", async () => {
    const res = await updateCircularAction("c-1", form);

    expect(res).toEqual({ success: true });
    expect(m.updateRecord.mock.calls[0][1]).toMatchObject({
      circularId: "c-1",
      schoolId: "s-1",
      departmentIds: ["d-1"],
    });
    expect(m.upload.mock.calls[0][1]).toMatchObject({ circularId: "c-1", uploadedBy: "p-1" });
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/circulars", "page");
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/circulars/c-1", "page");
  });

  it("does not upload files or refresh when the update fails", async () => {
    m.updateRecord.mockResolvedValue({ success: false, error: "not found" });
    const res = await updateCircularAction("c-1", form);

    expect(res.success).toBe(false);
    expect(m.upload).not.toHaveBeenCalled();
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
