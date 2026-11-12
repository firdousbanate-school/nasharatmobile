import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createQueryChain } from "@/test-utils/createQueryChain";
import { deleteAchievementRecord } from "./deleteAchievementRecord";
import { updateAchievementRecord } from "./updateAchievementRecord";

function clientFor(result: Parameters<typeof createQueryChain>[0]) {
  const query = createQueryChain(result);
  const from = (table: string) => {
    expect(["school_achievements", "achievement_attachments"]).toContain(table);
    return query.chain;
  };
  const storage = {
    from: () => ({
      remove: vi.fn().mockResolvedValue({}),
    }),
  };
  return {
    supabase: { from, storage } as unknown as SupabaseClient,
    calls: query.calls,
  };
}

const input = {
  id: "a-1",
  schoolId: "s-1",
  titleAr: "إنجاز",
  category: "academic",
  dateAchieved: "2026-10-01",
  visibility: "public",
} as Parameters<typeof updateAchievementRecord>[1];

describe("updateAchievementRecord", () => {
  it("updates only a row of the given school", async () => {
    const { supabase, calls } = clientFor({ data: [{ id: "a-1" }] });
    const res = await updateAchievementRecord(supabase, input);

    expect(res).toEqual({ success: true });
    expect(calls).toContainEqual(["eq", "id", "a-1"]);
    expect(calls).toContainEqual(["eq", "school_id", "s-1"]);
  });

  it("only touches the image when a new image path is given", async () => {
    const without = clientFor({ data: [{ id: "a-1" }] });
    await updateAchievementRecord(without.supabase, input);
    const withoutPayload = without.calls.find((c) => c[0] === "update")?.[1] as object;
    expect("image_path" in withoutPayload).toBe(false);

    const withImage = clientFor({ data: [{ id: "a-1" }] });
    await updateAchievementRecord(withImage.supabase, { ...input, imagePath: "s-1/new.png" });
    const withPayload = withImage.calls.find((c) => c[0] === "update")?.[1] as Record<
      string,
      unknown
    >;
    expect(withPayload.image_path).toBe("s-1/new.png");
  });

  it("does not report success when no row matched", async () => {
    const { supabase } = clientFor({ data: [] });
    expect(await updateAchievementRecord(supabase, input)).toEqual({
      success: false,
      error: "Achievement not found",
    });
  });

  it("returns the database error", async () => {
    const { supabase } = clientFor({ error: { message: "denied" } });
    expect(await updateAchievementRecord(supabase, input)).toEqual({
      success: false,
      error: "denied",
    });
  });
});

describe("deleteAchievementRecord", () => {
  it("deletes only a row of the given school", async () => {
    const { supabase, calls } = clientFor({ data: [{ id: "a-1" }] });
    const res = await deleteAchievementRecord(supabase, "a-1", "s-1");

    expect(res).toEqual({ success: true });
    expect(calls).toContainEqual(["delete"]);
    expect(calls).toContainEqual(["eq", "id", "a-1"]);
    expect(calls).toContainEqual(["eq", "school_id", "s-1"]);
  });

  it("does not report success when no row matched", async () => {
    const { supabase } = clientFor({ data: [] });
    expect(await deleteAchievementRecord(supabase, "a-other", "s-1")).toEqual({
      error: "Achievement not found",
    });
  });

  it("returns the database error", async () => {
    const { supabase } = clientFor({ error: { message: "denied" } });
    expect(await deleteAchievementRecord(supabase, "a-1", "s-1")).toEqual({ error: "denied" });
  });
});
