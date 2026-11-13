import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { parseBackupFile } from "./parseBackupFile";

describe("parseBackupFile", () => {
  it("successfully parses a valid JSON backup file", async () => {
    const payload = {
      metadata: { scope: "school", exportedAt: new Date().toISOString() },
      tables: { schools: [{ id: "school-1" }] },
    };
    const file = new File([JSON.stringify(payload)], "backup.json", {
      type: "application/json",
    });

    const res = await parseBackupFile(file);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.payload.tables.schools).toHaveLength(1);
      expect(res.storageFiles).toBeUndefined();
    }
  });

  it("returns invalid for malformed JSON file", async () => {
    const file = new File(["not json"], "backup.json", { type: "application/json" });
    const res = await parseBackupFile(file);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe("invalid");
    }
  });

  it("successfully unpacks a ZIP backup archive with storage files", async () => {
    const zip = new JSZip();
    const payload = {
      metadata: { scope: "school", exportedAt: new Date().toISOString() },
      tables: { schools: [{ id: "school-1" }] },
    };

    zip.file("database_backup.json", JSON.stringify(payload));
    zip.file("storage/public-assets/school-1/logo.png", "dummy-image-bytes");

    const zipBuffer = await zip.generateAsync({ type: "uint8array" });
    const zipFile = new File([zipBuffer.buffer as ArrayBuffer], "full_backup.zip", {
      type: "application/zip",
    });

    const res = await parseBackupFile(zipFile);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.payload.tables.schools).toHaveLength(1);
      expect(res.storageFiles).toHaveLength(1);
      expect(res.storageFiles?.[0].bucket).toBe("public-assets");
      expect(res.storageFiles?.[0].path).toBe("school-1/logo.png");
    }
  });
});
