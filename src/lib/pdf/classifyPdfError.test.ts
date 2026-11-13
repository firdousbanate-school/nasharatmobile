import { describe, expect, it } from "vitest";
import { classifyPdfError } from "./classifyPdfError";

describe("classifyPdfError", () => {
  it("classifies HTTP 401 as unauthorized (expired session)", () => {
    expect(classifyPdfError({ status: 401 })).toBe("unauthorized");
  });

  it("classifies HTTP 403 as forbidden", () => {
    expect(classifyPdfError({ status: 403 })).toBe("forbidden");
  });

  it("classifies HTTP 404 as notFound", () => {
    expect(classifyPdfError({ status: 404 })).toBe("notFound");
  });

  it("classifies PDF.js InvalidPDFException and PasswordException as corrupted", () => {
    const invalid = new Error("Invalid PDF structure");
    invalid.name = "InvalidPDFException";
    expect(classifyPdfError(invalid)).toBe("corrupted");

    const encrypted = new Error("No password given");
    encrypted.name = "PasswordException";
    expect(classifyPdfError(encrypted)).toBe("corrupted");
  });

  it("falls back to network for unknown or fetch errors", () => {
    expect(classifyPdfError(new TypeError("Failed to fetch"))).toBe("network");
    expect(classifyPdfError("unexpected")).toBe("network");
  });
});
