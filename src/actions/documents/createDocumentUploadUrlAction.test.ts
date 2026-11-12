import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAssertAuth, mockCreateSignedUploadUrl, mockAdminFrom } = vi.hoisted(() => ({
  mockAssertAuth: vi.fn(),
  mockCreateSignedUploadUrl: vi.fn(),
  mockAdminFrom: vi.fn(),
}));

vi.mock("@/lib/documents/assertCanManageDocuments", () => ({
  assertCanManageDocuments: () => mockAssertAuth(),
}));

vi.mock("@/lib/supabase/createSupabaseAdminClient", () => ({
  createSupabaseAdminClient: () => ({
    storage: {
      from: () => ({
        createSignedUploadUrl: mockCreateSignedUploadUrl,
      }),
    },
    from: (...args: unknown[]) => mockAdminFrom(...args),
  }),
}));

import { createDocumentUploadUrlAction } from "./createDocumentUploadUrlAction";

describe("createDocumentUploadUrlAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails if caller is unauthorized", async () => {
    mockAssertAuth.mockResolvedValueOnce({ allowed: false, schoolId: null });

    const res = await createDocumentUploadUrlAction({
      slug: "operational-plan",
      fileName: "test.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("Unauthorized to manage school documents");
    }
  });

  it("fails if slug is invalid", async () => {
    mockAssertAuth.mockResolvedValueOnce({
      allowed: true,
      schoolId: "school-123",
      profile: { id: "user-1" },
    });

    const res = await createDocumentUploadUrlAction({
      slug: "invalid-category" as unknown as "operational-plan",
      fileName: "test.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("Invalid document category");
    }
  });

  it("fails if file exceeds 25MB", async () => {
    mockAssertAuth.mockResolvedValueOnce({
      allowed: true,
      schoolId: "school-123",
      profile: { id: "user-1" },
    });

    const res = await createDocumentUploadUrlAction({
      slug: "operational-plan",
      fileName: "huge.pdf",
      fileSize: 26 * 1024 * 1024,
      mimeType: "application/pdf",
    });

    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe("File exceeds the 25MB limit");
    }
  });

  it("generates signed upload URL for valid document parameters", async () => {
    mockAssertAuth.mockResolvedValueOnce({
      allowed: true,
      schoolId: "school-123",
      profile: { id: "user-1" },
    });

    mockCreateSignedUploadUrl.mockResolvedValueOnce({
      data: {
        signedUrl: "https://storage.supabase.co/upload/sign",
        token: "upload-token-xyz",
        path: "school-123/operational-plan/test.pdf",
      },
      error: null,
    });

    const res = await createDocumentUploadUrlAction({
      slug: "operational-plan",
      fileName: "عاشر.pdf",
      fileSize: 15 * 1024 * 1024,
      mimeType: "application/pdf",
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.signedUrl).toBe("https://storage.supabase.co/upload/sign");
      expect(res.token).toBe("upload-token-xyz");
      expect(res.schoolId).toBe("school-123");
    }
  });
});
