import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkAuthRateLimit } from "./checkAuthRateLimit";
import { rateLimitBuckets } from "@/lib/rateLimit/rateLimitBuckets";
import { consumeSharedRateLimit } from "@/lib/rateLimit/consumeSharedRateLimit";

vi.mock("@/lib/rateLimit/consumeSharedRateLimit", () => ({
  consumeSharedRateLimit: vi.fn(),
}));

describe("checkAuthRateLimit", () => {
  beforeEach(() => {
    rateLimitBuckets.clear();
    vi.mocked(consumeSharedRateLimit).mockReset();
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(true);
  });

  it("allows requests under the limit", async () => {
    const result = await checkAuthRateLimit({
      action: "login",
      ip: "192.168.1.1",
      identifier: "user@school.com",
    });
    expect(result).toBe(true);
  });

  it("blocks when IP limit is exceeded on login", async () => {
    for (let i = 0; i < 10; i++) {
      expect(
        await checkAuthRateLimit({
          action: "login",
          ip: "10.0.0.1",
          identifier: `user${i}@school.com`,
        }),
      ).toBe(true);
    }

    const blocked = await checkAuthRateLimit({
      action: "login",
      ip: "10.0.0.1",
      identifier: "user11@school.com",
    });
    expect(blocked).toBe(false);
  });

  it("blocks when account identifier limit is exceeded on password reset", async () => {
    for (let i = 0; i < 3; i++) {
      expect(
        await checkAuthRateLimit({
          action: "password_reset",
          ip: `192.168.1.${i + 1}`,
          identifier: "victim@school.com",
        }),
      ).toBe(true);
    }

    const blocked = await checkAuthRateLimit({
      action: "password_reset",
      ip: "192.168.1.100",
      identifier: "victim@school.com",
    });
    expect(blocked).toBe(false);
  });

  it("blocks when owner claim limit is exceeded", async () => {
    for (let i = 0; i < 5; i++) {
      expect(
        await checkAuthRateLimit({
          action: "owner_claim",
          ip: "127.0.0.1",
          identifier: "user-uuid-1",
        }),
      ).toBe(true);
    }

    const blocked = await checkAuthRateLimit({
      action: "owner_claim",
      ip: "127.0.0.1",
      identifier: "user-uuid-1",
    });
    expect(blocked).toBe(false);
  });

  it("blocks when the shared (cross-instance) limit is exceeded", async () => {
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(false);
    const result = await checkAuthRateLimit({
      action: "login",
      ip: "172.16.0.1",
      identifier: "shared@school.com",
    });
    expect(result).toBe(false);
  });

  it("fails open when the shared store is unreachable", async () => {
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(null);
    const result = await checkAuthRateLimit({
      action: "login",
      ip: "172.16.0.2",
      identifier: "outage@school.com",
    });
    expect(result).toBe(true);
  });

  it("still enforces the in-process limit when the shared store is unreachable", async () => {
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(null);
    for (let i = 0; i < 10; i++) {
      await checkAuthRateLimit({ action: "login", ip: "172.16.0.3", identifier: `u${i}@s.com` });
    }
    const blocked = await checkAuthRateLimit({
      action: "login",
      ip: "172.16.0.3",
      identifier: "u99@s.com",
    });
    expect(blocked).toBe(false);
  });

  it("checks the shared limit for the IP key and the account key", async () => {
    await checkAuthRateLimit({ action: "password_reset", ip: "172.16.0.4", identifier: "A@S.com" });
    const keys = vi.mocked(consumeSharedRateLimit).mock.calls.map((c) => c[0]);
    expect(keys).toEqual(["auth:password_reset:ip:172.16.0.4", "auth:password_reset:id:a@s.com"]);
  });
});
