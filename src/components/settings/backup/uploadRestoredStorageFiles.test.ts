import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadRestoredStorageFiles } from "./uploadRestoredStorageFiles";
import { createStorageUploadUrlAction } from "@/actions/backup/createStorageUploadUrlAction";

const mockUploadToSignedUrl = vi.fn();
vi.mock("@/lib/supabase/createSupabaseBrowserClient", () => ({
  createSupabaseBrowserClient: vi.fn().mockReturnValue({
    storage: {
      from: vi.fn().mockReturnValue({
        uploadToSignedUrl: (...args: unknown[]) => mockUploadToSignedUrl(...args),
      }),
    },
  }),
}));

vi.mock("@/actions/backup/createStorageUploadUrlAction", () => ({
  createStorageUploadUrlAction: vi.fn(),
}));

describe("uploadRestoredStorageFiles", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockUploadToSignedUrl.mockReset();
  });

  it("returns 0 when array is empty", async () => {
    const count = await uploadRestoredStorageFiles([]);
    expect(count).toBe(0);
  });

  it("uploads files using signed URLs and returns count of successes", async () => {
    vi.mocked(createStorageUploadUrlAction).mockResolvedValue({
      success: true,
      signedUrl: "https://storage.example.com/sign",
      token: "tok-1",
      path: "school-1/logo.png",
    });

    mockUploadToSignedUrl.mockResolvedValue({ data: { path: "school-1/logo.png" }, error: null });

    const files = [
      {
        bucket: "public-assets",
        path: "school-1/logo.png",
        file: new File(["data"], "logo.png", { type: "image/png" }),
      },
    ];

    const count = await uploadRestoredStorageFiles(files);
    expect(count).toBe(1);
    expect(mockUploadToSignedUrl).toHaveBeenCalledWith(
      "school-1/logo.png",
      "tok-1",
      expect.any(File),
      expect.objectContaining({
        contentType: "image/png",
        upsert: true,
      }),
    );
  });

  it("gracefully tolerates individual file failure without throwing", async () => {
    vi.mocked(createStorageUploadUrlAction).mockResolvedValue({
      success: false,
      error: "Some storage error",
      code: "STORAGE_ERROR",
    });

    const files = [
      {
        bucket: "public-assets",
        path: "school-1/failing.png",
        file: new File(["data"], "failing.png"),
      },
    ];

    const count = await uploadRestoredStorageFiles(files);
    expect(count).toBe(0);
  });
});
