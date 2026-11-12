import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/createSupabaseAdminClient", () => ({
  createSupabaseAdminClient: () => ({ rpc }),
}));
vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));

import { consumeSharedRateLimit } from "./consumeSharedRateLimit";
import { logError } from "@/lib/logger/logError";

describe("consumeSharedRateLimit", () => {
  beforeEach(() => {
    rpc.mockReset();
    vi.mocked(logError).mockClear();
  });

  it("returns the database verdict and sends a hashed key with whole seconds", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    const result = await consumeSharedRateLimit("auth:login:id:user@school.com", 5, 300_000);

    expect(result).toBe(false);
    const [fn, args] = rpc.mock.calls[0];
    expect(fn).toBe("consume_rate_limit");
    expect(args.p_limit).toBe(5);
    expect(args.p_window_seconds).toBe(300);
    expect(args.p_key).toMatch(/^[0-9a-f]{64}$/);
    expect(args.p_key).not.toContain("user@school.com");
  });

  it("returns null and logs when the RPC fails", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "boom", code: "XX000" } });
    expect(await consumeSharedRateLimit("k", 1, 1000)).toBeNull();
    expect(logError).toHaveBeenCalled();
  });

  it("returns null and logs when the client throws (for example missing env)", async () => {
    rpc.mockRejectedValue(new Error("no env"));
    expect(await consumeSharedRateLimit("k", 1, 1000)).toBeNull();
    expect(logError).toHaveBeenCalled();
  });
});
