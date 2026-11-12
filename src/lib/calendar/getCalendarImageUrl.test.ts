import { describe, it, expect, vi } from "vitest";
import { getCalendarImageUrl } from "./getCalendarImageUrl";

vi.mock("@/lib/env", () => ({
  getClientEnv: () => ({
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  }),
}));

describe("getCalendarImageUrl", () => {
  it("returns null for empty or missing paths", () => {
    expect(getCalendarImageUrl(null)).toBeNull();
    expect(getCalendarImageUrl(undefined)).toBeNull();
    expect(getCalendarImageUrl("   ")).toBeNull();
  });

  it("preserves full HTTP/HTTPS URLs", () => {
    expect(getCalendarImageUrl("https://cdn.example.com/img.png")).toBe(
      "https://cdn.example.com/img.png",
    );
  });

  it("resolves relative calendar storage paths to public-assets bucket", () => {
    expect(getCalendarImageUrl("school-1/calendar/photo.png")).toBe(
      "https://test.supabase.co/storage/v1/object/public/public-assets/school-1/calendar/photo.png",
    );
    expect(getCalendarImageUrl("/public-assets/school-1/calendar/photo.png")).toBe(
      "https://test.supabase.co/storage/v1/object/public/public-assets/school-1/calendar/photo.png",
    );
  });
});
