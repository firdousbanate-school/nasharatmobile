import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createQueryChain, type QueryCall } from "@/test-utils/createQueryChain";
import { syncRolePermissions } from "./syncRolePermissions";

type Step = { result: Parameters<typeof createQueryChain>[0]; calls: QueryCall[] };

/** Each `from("role_permissions")` call gets the next scripted result, in order. */
function scriptedClient(results: Parameters<typeof createQueryChain>[0][]) {
  const steps: Step[] = [];
  const queue = [...results];
  const from = (table: string) => {
    expect(table).toBe("role_permissions");
    const result = queue.shift() ?? {};
    const query = createQueryChain(result);
    steps.push({ result, calls: query.calls });
    return query.chain;
  };
  return { supabase: { from } as unknown as SupabaseClient, steps };
}

const existing = (...keys: string[]) => ({ data: keys.map((k) => ({ permission_key: k })) });
const kinds = (steps: Step[]) =>
  steps.map((s) => s.calls.map((c) => c[0]).filter((n) => n !== "eq"));

describe("syncRolePermissions", () => {
  it("adds only the missing permissions and removes only the dropped ones", async () => {
    const { supabase, steps } = scriptedClient([existing("a", "b"), {}, {}]);
    await syncRolePermissions(supabase, "r-1", ["b", "c"]);

    expect(steps[1].calls).toContainEqual(["insert", [{ role_id: "r-1", permission_key: "c" }]]);
    expect(steps[2].calls).toContainEqual(["in", "permission_key", ["a"]]);
    expect(steps[2].calls).toContainEqual(["eq", "role_id", "r-1"]);
  });

  it("does nothing when the permissions are already the same", async () => {
    const { supabase, steps } = scriptedClient([existing("a", "b")]);
    await syncRolePermissions(supabase, "r-1", ["b", "a", "a"]);

    expect(steps).toHaveLength(1);
  });

  it("clears the role only when an empty set is requested", async () => {
    const { supabase, steps } = scriptedClient([existing("a", "b"), {}]);
    await syncRolePermissions(supabase, "r-1", []);

    expect(kinds(steps)).toEqual([["select"], ["delete", "in"]]);
    expect(steps[1].calls).toContainEqual(["in", "permission_key", ["a", "b"]]);
  });

  it("never deletes anything when adding fails (the role keeps its old permissions)", async () => {
    const fkViolation = { code: "23503", message: "unknown permission" };
    const { supabase, steps } = scriptedClient([existing("a"), { error: fkViolation }]);

    await expect(syncRolePermissions(supabase, "r-1", ["bogus"])).rejects.toBe(fkViolation);
    expect(steps).toHaveLength(2);
    expect(kinds(steps).flat()).not.toContain("delete");
  });

  it("reports a failed read without changing anything", async () => {
    const readError = { code: "42501", message: "denied" };
    const { supabase, steps } = scriptedClient([{ error: readError }]);

    await expect(syncRolePermissions(supabase, "r-1", ["a"])).rejects.toBe(readError);
    expect(steps).toHaveLength(1);
  });

  it("reports a failed delete after a successful add", async () => {
    const deleteError = { code: "42501", message: "denied" };
    const { supabase } = scriptedClient([existing("a"), {}, { error: deleteError }]);

    await expect(syncRolePermissions(supabase, "r-1", ["b"])).rejects.toBe(deleteError);
  });
});
