import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUploadDirect, mockSaveDirect, mockUpdateDirect } = vi.hoisted(() => ({
  mockUploadDirect: vi.fn(),
  mockSaveDirect: vi.fn(),
  mockUpdateDirect: vi.fn(),
}));

vi.mock("@/lib/documents/uploadDocumentDirectToStorage", () => ({
  uploadDocumentDirectToStorage: (...args: unknown[]) => mockUploadDirect(...args),
}));

vi.mock("@/actions/documents/saveDirectDocumentAction", () => ({
  saveDirectDocumentAction: (...args: unknown[]) => mockSaveDirect(...args),
}));

vi.mock("@/actions/documents/updateDirectDocumentAction", () => ({
  updateDirectDocumentAction: (...args: unknown[]) => mockUpdateDirect(...args),
}));

import { submitDocumentDirect } from "./submitDocumentDirect";

describe("submitDocumentDirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if creating new document without file", async () => {
    const res = await submitDocumentDirect({
      slug: "operational-plan",
      title: "Plan",
      description: "",
      file: null,
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("Document file is required");
    }
  });

  it("uploads file directly to storage and saves document record", async () => {
    const file = new File(["dummy content"], "عاشر.pdf", { type: "application/pdf" });
    mockUploadDirect.mockResolvedValueOnce({
      ok: true,
      filePath: "school-1/operational-plan/123_test.pdf",
    });
    mockSaveDirect.mockResolvedValueOnce({
      success: true,
      documentId: "new-doc-123",
    });

    const res = await submitDocumentDirect({
      slug: "operational-plan",
      title: "عاشر",
      description: "خطة تشغيلية",
      file,
    });

    expect(res.success).toBe(true);
    expect(mockUploadDirect).toHaveBeenCalledWith({
      slug: "operational-plan",
      file,
    });
    expect(mockSaveDirect).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "operational-plan",
        title: "عاشر",
        filePath: "school-1/operational-plan/123_test.pdf",
      }),
    );
  });

  it("updates existing document without replacing file when file is null", async () => {
    mockUpdateDirect.mockResolvedValueOnce({ success: true });

    const res = await submitDocumentDirect({
      slug: "operational-plan",
      existingDoc: {
        id: "doc-1",
        school_id: "school-1",
        slug: "operational-plan",
        title: "Old Title",
        description: null,
        file_path: "school-1/operational-plan/old.pdf",
        file_name: "old.pdf",
        file_size: 100,
        mime_type: "application/pdf",
        created_by: null,
        created_at: "",
        updated_at: "",
      },
      title: "New Title",
      description: "",
      file: null,
    });

    expect(res.success).toBe(true);
    expect(mockUploadDirect).not.toHaveBeenCalled();
    expect(mockUpdateDirect).toHaveBeenCalledWith({
      id: "doc-1",
      title: "New Title",
      description: null,
      fileUpdate: undefined,
    });
  });
});
