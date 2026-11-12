import { describe, expect, it } from "vitest";
import { getParentPath } from "./getParentPath";

describe("getParentPath", () => {
  it("returns null on top-level screens", () => {
    expect(getParentPath("/dashboard")).toBeNull();
    expect(getParentPath("/circulars")).toBeNull();
    expect(getParentPath("/")).toBeNull();
  });

  it("returns the parent route on nested screens", () => {
    expect(getParentPath("/circulars/123")).toBe("/circulars");
    expect(getParentPath("/circulars/123/edit")).toBe("/circulars/123");
    expect(getParentPath("/settings/users")).toBe("/settings");
    expect(getParentPath("/calendar/new")).toBe("/calendar");
  });
});
