import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAssertAuth, mockAdminInsert, mockAdminSingle } = vi.hoisted(() => ({
  mockAssertAuth: vi.fn(),
  mockAdminInsert: vi.fn(),
  mockAdminSingle: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/documents/assertCanManageDocuments", () => ({
  assertCanManageDocuments: () => mockAssertAuth(),
}));

vi.mock("@/lib/supabase/createSupabaseAdminClient", () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({
      insert: (...args: unknown[]) => {
        mockAdminInsert(...args);
        return {
          select: () => ({
            single: mockAdminSingle,
          }),
        };
      },
    }),
  }),
}));

import { saveDirectDocumentAction } from "./saveDirectDocumentAction";

describe("saveDirectDocumentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if unauthorized", async () => {
    mockAssertAuth.mockResolvedValueOnce({ allowed: false, schoolId: null });

    const res = await saveDirectDocumentAction({
      slug: "operational-plan",
      title: "Plan 2026",
      filePath: "school-123/operational-plan/test.pdf",
      fileName: "test.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
    });

    expect(res.success).toBe(false);
  });

  it("fails if filePath belongs to another school", async () => {
    mockAssertAuth.mockResolvedValueOnce({
      allowed: true,
      schoolId: "school-123",
      profile: { id: "user-1" },
    });

    const res = await saveDirectDocumentAction({
      slug: "operational-plan",
      title: "Plan 2026",
      filePath: "school-OTHER/operational-plan/test.pdf",
      fileName: "test.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("Invalid storage path for school document");
    }
  });

  it("saves document record successfully with metadata", async () => {
    mockAssertAuth.mockResolvedValueOnce({
      allowed: true,
      schoolId: "school-123",
      profile: { id: "user-1" },
    });

    mockAdminSingle.mockResolvedValueOnce({
      data: { id: "doc-created-999" },
      error: null,
    });

    const res = await saveDirectDocumentAction({
      slug: "operational-plan",
      title: "Plan 2026",
      description: "My direct plan",
      filePath: "school-123/operational-plan/12345_plan.pdf",
      fileName: "plan.pdf",
      fileSize: 15 * 1024 * 1024,
      mimeType: "application/pdf",
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.documentId).toBe("doc-created-999");
    }
  });
});
