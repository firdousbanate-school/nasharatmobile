import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const m = vi.hoisted(() => ({
  assertCan: vi.fn(),
  parse: vi.fn(),
  assertDocs: vi.fn(),
  createRecord: vi.fn(),
  insertTargets: vi.fn(),
  upload: vi.fn(),
  from: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ from: m.from }),
}));
vi.mock("@/lib/circulars/assertCanManageCirculars", () => ({
  assertCanManageCirculars: m.assertCan,
}));
vi.mock("@/lib/validation/parseCircularFormData", () => ({ parseCircularFormData: m.parse }));
vi.mock("@/lib/circulars/assertValidCircularDocuments", () => ({
  assertValidCircularDocuments: m.assertDocs,
}));
vi.mock("@/lib/circulars/createCircularRecord", () => ({ createCircularRecord: m.createRecord }));
vi.mock("@/lib/circulars/insertCircularTargets", () => ({
  insertCircularTargets: m.insertTargets,
}));
vi.mock("@/lib/circulars/handleCircularDocumentsUpload", () => ({
  handleCircularDocumentsUpload: m.upload,
}));

import { createCircularAction } from "./createCircularAction";

const form = new FormData();
const parsed = {
  title: "Exam schedule",
  body: "Details",
  priority: "normal",
  visibility: "internal",
  responseType: "none",
  dueAt: null,
  departmentIds: ["d-1"],
};

describe("createCircularAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertCan.mockResolvedValue({ authorized: true, profileId: "p-1", schoolId: "s-1" });
    m.parse.mockReturnValue(parsed);
    m.assertDocs.mockResolvedValue(undefined);
    m.createRecord.mockResolvedValue({ circularId: "c-1" });
    m.insertTargets.mockResolvedValue({ error: null });
    m.upload.mockResolvedValue({ error: null });
  });

  it("refuses unauthorized callers before parsing or writing", async () => {
    m.assertCan.mockResolvedValue({ authorized: false, error: "Unauthorized" });
    const res = await createCircularAction(form);

    expect(res.success).toBe(false);
    expect(m.parse).not.toHaveBeenCalled();
    expect(m.createRecord).not.toHaveBeenCalled();
  });

  it("requires a title and a body", async () => {
    m.parse.mockReturnValue({ ...parsed, title: "" });
    const res = await createCircularAction(form);

    expect(res.success).toBe(false);
    expect(res.error).toBe("Title and content are required");
    expect(m.createRecord).not.toHaveBeenCalled();
  });

  it("creates the circular for the caller's school and author, with its targets and files", async () => {
    const res = await createCircularAction(form);

    expect(res).toEqual({ success: true, circularId: "c-1" });
    expect(m.createRecord.mock.calls[0][1]).toMatchObject({
      schoolId: "s-1",
      createdBy: "p-1",
      title: "Exam schedule",
    });
    expect(m.insertTargets.mock.calls[0].slice(1)).toEqual(["c-1", "s-1", ["d-1"]]);
    expect(m.upload.mock.calls[0][1]).toMatchObject({ circularId: "c-1", schoolId: "s-1" });
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/circulars", "page");
  });

  it("fails without inserting targets when the circular row cannot be created", async () => {
    m.createRecord.mockResolvedValue({ circularId: null, error: "boom" });
    const res = await createCircularAction(form);

    expect(res.success).toBe(false);
    expect(m.insertTargets).not.toHaveBeenCalled();
  });

  it("rolls back the circular when its targets cannot be saved", async () => {
    m.insertTargets.mockResolvedValue({ error: { code: "23503", message: "fk" } });
    const rollback = createQueryChain();
    m.from.mockReturnValue(rollback.chain);

    const res = await createCircularAction(form);

    expect(res.success).toBe(false);
    expect(m.from).toHaveBeenCalledWith("circulars");
    expect(rollback.calls).toContainEqual(["delete"]);
    expect(rollback.calls).toContainEqual(["eq", "id", "c-1"]);
    expect(m.upload).not.toHaveBeenCalled();
    expect(m.revalidate).not.toHaveBeenCalled();
  });

  it("reports a failed document upload without claiming success", async () => {
    m.upload.mockResolvedValue({ error: { code: "XX000", message: "upload failed" } });
    const res = await createCircularAction(form);

    expect(res.success).toBe(false);
    expect(m.revalidate).not.toHaveBeenCalled();
  });
});
