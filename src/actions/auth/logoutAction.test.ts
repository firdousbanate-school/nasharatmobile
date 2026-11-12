import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ signOut: vi.fn(), redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect: m.redirect }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue({ auth: { signOut: m.signOut } }),
}));

import { logoutAction } from "./logoutAction";

describe("logoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.signOut.mockResolvedValue({ error: null });
  });

  it("signs the user out, then redirects to the home page", async () => {
    const order: string[] = [];
    m.signOut.mockImplementation(async () => order.push("signOut"));
    m.redirect.mockImplementation(() => order.push("redirect"));

    await logoutAction();

    expect(order).toEqual(["signOut", "redirect"]);
    expect(m.redirect).toHaveBeenCalledWith("/");
  });
});
