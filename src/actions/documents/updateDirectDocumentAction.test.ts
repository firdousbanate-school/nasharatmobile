import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAssertAuth, mockFindDoc, mockAdminUpdate, mockAdminRemove } = vi.hoisted(() => ({
  mockAssertAuth: vi.fn(),
  mockFindDoc: vi.fn(),
  mockAdminUpdate: vi.fn(),
  mockAdminRemove: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/documents/assertCanManageDocuments", () => ({
  assertCanManageDocuments: () => mockAssertAuth(),
}));

vi.mock("@/lib/documents/findDocumentForSchool", () => ({
  findDocumentForSchool: (...args: unknown[]) => mockFindDoc(...args),
}));

vi.mock("@/lib/supabase/createSupabaseAdminClient", () => ({
  createSupabaseAdminClient: () => ({
    storage: {
      from: () => ({
        remove: mockAdminRemove,
      }),
    },
    from: () => ({
      update: (...args: unknown[]) => {
        mockAdminUpdate(...args);
        return {
          eq: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        };
      },
    }),
  }),
}));

import { updateDirectDocumentAction } from "./updateDirectDocumentAction";

describe("updateDirectDocumentAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates document metadata without file", async () => {
    mockAssertAuth.mockResolvedValueOnce({
      allowed: true,
      schoolId: "school-123",
      profile: { id: "user-1" },
    });

    mockFindDoc.mockResolvedValueOnce({
      id: "doc-1",
      school_id: "school-123",
      slug: "operational-plan",
      file_path: "school-123/operational-plan/old.pdf",
    });

    const res = await updateDirectDocumentAction({
      id: "doc-1",
      title: "Updated Title",
      description: "Updated Desc",
    });

    expect(res.success).toBe(true);
    expect(mockAdminRemove).not.toHaveBeenCalled();
  });

  it("updates document with new file and removes old file from storage", async () => {
    mockAssertAuth.mockResolvedValueOnce({
      allowed: true,
      schoolId: "school-123",
      profile: { id: "user-1" },
    });

    mockFindDoc.mockResolvedValueOnce({
      id: "doc-1",
      school_id: "school-123",
      slug: "operational-plan",
      file_path: "school-123/operational-plan/old.pdf",
    });

    const res = await updateDirectDocumentAction({
      id: "doc-1",
      title: "Updated Title",
      fileUpdate: {
        filePath: "school-123/operational-plan/new.pdf",
        fileName: "new.pdf",
        fileSize: 12 * 1024 * 1024,
        mimeType: "application/pdf",
      },
    });

    expect(res.success).toBe(true);
    expect(mockAdminRemove).toHaveBeenCalledWith(["school-123/operational-plan/old.pdf"]);
  });
});
