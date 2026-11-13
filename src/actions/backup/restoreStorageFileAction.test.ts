import { describe, it, expect, vi, beforeEach } from "vitest";
import { restoreStorageFileAction } from "./restoreStorageFileAction";
import * as assertCanManageBackupModule from "@/lib/backup/assertCanManageBackup";

const mockUpload = vi.fn();
vi.mock("@/lib/supabase", () => ({
  createSupabaseAdminClient: vi.fn().mockReturnValue({
    storage: {
      from: vi.fn().mockReturnValue({
        upload: (...args: unknown[]) => mockUpload(...args),
      }),
    },
  }),
}));

describe("restoreStorageFileAction", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockUpload.mockReset();
  });

  it("returns error if caller is unauthorized", async () => {
    vi.spyOn(assertCanManageBackupModule, "assertCanManageBackup").mockResolvedValue({
      allowed: false,
      isOwner: false,
      schoolId: null,
      userId: null,
      userEmail: null,
    });

    const fd = new FormData();
    fd.append("bucket", "public-assets");
    fd.append("path", "school-1/logo.png");
    fd.append("file", new File(["test"], "logo.png", { type: "image/png" }));

    const res = await restoreStorageFileAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toContain("Unauthorized");
  });

  it("rejects unpermitted bucket", async () => {
    vi.spyOn(assertCanManageBackupModule, "assertCanManageBackup").mockResolvedValue({
      allowed: true,
      isOwner: true,
      schoolId: "school-1",
      userId: "user-1",
      userEmail: "owner@example.com",
    });

    const fd = new FormData();
    fd.append("bucket", "malicious-bucket");
    fd.append("path", "school-1/logo.png");
    fd.append("file", new File(["test"], "logo.png"));

    const res = await restoreStorageFileAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toContain("Invalid or unpermitted storage bucket");
  });

  it("rejects path traversal", async () => {
    vi.spyOn(assertCanManageBackupModule, "assertCanManageBackup").mockResolvedValue({
      allowed: true,
      isOwner: true,
      schoolId: "school-1",
      userId: "user-1",
      userEmail: "owner@example.com",
    });

    const fd = new FormData();
    fd.append("bucket", "public-assets");
    fd.append("path", "../etc/passwd");
    fd.append("file", new File(["test"], "logo.png"));

    const res = await restoreStorageFileAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toContain("Invalid storage file path");
  });

  it("rejects file belonging to another school when operator has school scope", async () => {
    vi.spyOn(assertCanManageBackupModule, "assertCanManageBackup").mockResolvedValue({
      allowed: true,
      isOwner: false,
      schoolId: "school-1",
      userId: "user-1",
      userEmail: "principal@example.com",
    });

    const fd = new FormData();
    fd.append("bucket", "public-assets");
    fd.append("path", "school-999/logo.png");
    fd.append("file", new File(["test"], "logo.png"));

    const res = await restoreStorageFileAction(fd);
    expect(res.success).toBe(false);
    expect(res.error).toContain("outside the assigned school");
  });

  it("successfully uploads file when authorized", async () => {
    vi.spyOn(assertCanManageBackupModule, "assertCanManageBackup").mockResolvedValue({
      allowed: true,
      isOwner: true,
      schoolId: "school-1",
      userId: "user-1",
      userEmail: "owner@example.com",
    });

    mockUpload.mockResolvedValue({ error: null });

    const fd = new FormData();
    fd.append("bucket", "public-assets");
    fd.append("path", "school-1/logo.png");
    fd.append("file", new File(["test-content"], "logo.png", { type: "image/png" }));

    const res = await restoreStorageFileAction(fd);
    expect(res.success).toBe(true);
    expect(mockUpload).toHaveBeenCalledWith("school-1/logo.png", expect.any(Buffer), {
      upsert: true,
      contentType: "image/png",
    });
  });
});
