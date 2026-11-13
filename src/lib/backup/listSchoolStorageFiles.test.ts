import { describe, it, expect, vi } from "vitest";
import { listSchoolStorageFiles } from "./listSchoolStorageFiles";

describe("listSchoolStorageFiles", () => {
  it("recursively discovers files and generates signed URLs", async () => {
    const mockList = vi.fn().mockImplementation((prefix: string) => {
      if (prefix === "school-123") {
        return Promise.resolve({
          data: [
            { name: "subfolder", id: null },
            { name: "file1.pdf", id: "f-1", metadata: { size: 1024 } },
          ],
          error: null,
        });
      }
      if (prefix === "school-123/subfolder") {
        return Promise.resolve({
          data: [{ name: "file2.png", id: "f-2", metadata: { size: 2048 } }],
          error: null,
        });
      }
      return Promise.resolve({ data: [], error: null });
    });

    const mockCreateSignedUrl = vi.fn().mockImplementation((path: string) => {
      return Promise.resolve({
        data: { signedUrl: `https://example.com/download/${path}` },
        error: null,
      });
    });

    const mockAdmin = {
      storage: {
        from: () => ({
          list: mockList,
          createSignedUrl: mockCreateSignedUrl,
        }),
      },
    } as unknown as Parameters<typeof listSchoolStorageFiles>[0];

    const results = await listSchoolStorageFiles(mockAdmin, "school-123");

    expect(results.length).toBeGreaterThan(0);
    const paths = results.map((r) => r.path);
    expect(paths).toContain("school-123/file1.pdf");
    expect(paths).toContain("school-123/subfolder/file2.png");
  });

  it("handles storage errors gracefully without throwing", async () => {
    const mockAdmin = {
      storage: {
        from: () => ({
          list: vi.fn().mockResolvedValue({ data: null, error: new Error("Storage unavailable") }),
          createSignedUrl: vi.fn(),
        }),
      },
    } as unknown as Parameters<typeof listSchoolStorageFiles>[0];

    const results = await listSchoolStorageFiles(mockAdmin, "school-123");
    expect(results).toEqual([]);
  });
});
