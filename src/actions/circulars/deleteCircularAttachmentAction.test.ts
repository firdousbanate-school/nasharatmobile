import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

const m = vi.hoisted(() => ({
  profile: vi.fn(),
  assertCan: vi.fn(),
  from: vi.fn(),
  remove: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: m.revalidate }));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));
vi.mock("@/lib/auth/getCurrentProfile", () => ({ getCurrentProfile: m.profile }));
vi.mock("./assertCanDeleteAttachment", () => ({ assertCanDeleteAttachment: m.assertCan }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({
    from: m.from,
    storage: { from: () => ({ remove: m.remove }) },
  }),
}));

import { deleteCircularAttachmentAction } from "./deleteCircularAttachmentAction";

/** First `from("circular_attachments")` call reads the path, the second deletes the row. */
function setupAttachmentTable(read: object, del: object) {
  const reader = createQueryChain(read);
  const deleter = createQueryChain(del);
  m.from.mockReturnValueOnce(reader.chain).mockReturnValueOnce(deleter.chain);
  return { reader, deleter };
}

describe("deleteCircularAttachmentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.from.mockReset(); // clearAllMocks keeps queued mockReturnValueOnce values
    m.profile.mockResolvedValue({ id: "p-1", school_id: "s-1" });
    m.assertCan.mockResolvedValue(undefined);
    m.remove.mockResolvedValue({ error: null });
  });

  it("requires a signed-in user", async () => {
    m.profile.mockResolvedValue(null);
    const res = await deleteCircularAttachmentAction("a-1", "c-1");

    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
  });

  it("checks the caller's rights for their school before touching storage or rows", async () => {
    m.assertCan.mockRejectedValue(Object.assign(new Error("Unauthorized"), {}));
    const res = await deleteCircularAttachmentAction("a-1", "c-1");

    expect(m.assertCan).toHaveBeenCalledWith("s-1", "p-1");
    expect(res.success).toBe(false);
    expect(m.from).not.toHaveBeenCalled();
    expect(m.remove).not.toHaveBeenCalled();
  });

  it("removes the stored file, then the row, then refreshes the circular page", async () => {
    setupAttachmentTable({ data: { path: "s-1/c-1/file.pdf" } }, { data: { id: "a-1" } });
    const res = await deleteCircularAttachmentAction("a-1", "c-1");

    expect(res).toEqual({ success: true });
    expect(m.remove).toHaveBeenCalledWith(["s-1/c-1/file.pdf"]);
    expect(m.revalidate).toHaveBeenCalledWith("/[locale]/circulars/c-1", "page");
  });

  it("keeps the row when the stored file cannot be removed (no orphan, no false success)", async () => {
    const { deleter } = setupAttachmentTable({ data: { path: "x.pdf" } }, { data: { id: "a-1" } });
    m.remove.mockResolvedValue({ error: { message: "storage down" } });
    const res = await deleteCircularAttachmentAction("a-1", "c-1");

    expect(res.success).toBe(false);
    expect(deleter.calls).toEqual([]);
    expect(m.revalidate).not.toHaveBeenCalled();
  });

  it("reports not found when no row was deleted", async () => {
    setupAttachmentTable({ data: null }, { data: null });
    const res = await deleteCircularAttachmentAction("a-404", "c-1");

    expect(res.success).toBe(false);
    expect(res.error).toBe("Attachment not found");
    expect(m.remove).not.toHaveBeenCalled();
  });
});
