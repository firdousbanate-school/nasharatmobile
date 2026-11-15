import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryChain } from "@/test-utils/createQueryChain";

vi.mock("@/lib/logger/logError", () => ({ logError: vi.fn() }));

import { cleanupOldReadNotifications } from "./cleanupOldReadNotifications";

describe("cleanupOldReadNotifications", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes read notifications older than 90 days and returns count", async () => {
    const chainObj = createQueryChain({ data: [{ id: "1" }, { id: "2" }] });
    const mockClient = { from: vi.fn().mockReturnValue(chainObj.chain) };

    const count = await cleanupOldReadNotifications(mockClient as never, 90);
    expect(count).toBe(2);
    expect(mockClient.from).toHaveBeenCalledWith("notifications");
    expect(chainObj.calls).toContainEqual(["not", "read_at", "is", null]);
  });

  it("returns 0 when deletion fails", async () => {
    const chainObj = createQueryChain({ error: { message: "db error" } });
    const mockClient = { from: vi.fn().mockReturnValue(chainObj.chain) };

    const count = await cleanupOldReadNotifications(mockClient as never, 90);
    expect(count).toBe(0);
  });
});
