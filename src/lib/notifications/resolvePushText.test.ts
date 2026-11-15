import { describe, it, expect } from "vitest";
import { resolvePushText } from "./resolvePushText";

describe("resolvePushText", () => {
  it("formats circular published payload with ref, title, and url", () => {
    const res = resolvePushText({
      title: "circular_published",
      body: JSON.stringify({ ref: "2026/01", title: "Exam Schedule" }),
      entityType: "circular",
      entityId: "c-1",
    });

    expect(res.title).toContain("Circular");
    expect(res.body).toBe("#2026/01 — Exam Schedule");
    expect(res.url).toBe("/circulars/c-1");
  });

  it("falls back to /notifications when entityId is missing", () => {
    const res = resolvePushText({
      title: "Custom Alert",
      body: "System check",
    });

    expect(res.title).toBe("Custom Alert");
    expect(res.body).toBe("System check");
    expect(res.url).toBe("/notifications");
  });
});
