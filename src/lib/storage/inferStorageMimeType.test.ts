import { describe, it, expect } from "vitest";
import { inferStorageMimeType } from "./inferStorageMimeType";

describe("inferStorageMimeType", () => {
  it("preserves valid declared type", () => {
    expect(inferStorageMimeType("photo.jpg", "image/jpeg")).toBe("image/jpeg");
    expect(inferStorageMimeType("doc.pdf", "application/pdf")).toBe("application/pdf");
  });

  it("infers mime from extensions when declared type is missing or generic", () => {
    expect(inferStorageMimeType("image.png", "")).toBe("image/png");
    expect(inferStorageMimeType("image.PNG", undefined)).toBe("image/png");
    expect(inferStorageMimeType("report.pdf", "application/octet-stream")).toBe("application/pdf");
    expect(inferStorageMimeType("school/logo.jpeg")).toBe("image/jpeg");
    expect(inferStorageMimeType("icon.svg")).toBe("image/svg+xml");
    expect(inferStorageMimeType("word.docx")).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(inferStorageMimeType("sheet.xlsx")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  });

  it("falls back to application/octet-stream for unknown extensions", () => {
    expect(inferStorageMimeType("unknown.xyz")).toBe("application/octet-stream");
    expect(inferStorageMimeType("no_extension")).toBe("application/octet-stream");
  });
});
