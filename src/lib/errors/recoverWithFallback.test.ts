import { describe, expect, it, vi } from "vitest";
import { recoverWithFallback } from "./recoverWithFallback";

vi.mock("../logger/logError", () => ({ logError: vi.fn() }));

import { logError } from "../logger/logError";

describe("recoverWithFallback", () => {
  it("returns the fallback and logs the failure with its context", async () => {
    const result = await Promise.reject(new Error("db down")).catch(
      recoverWithFallback([] as string[], { where: "test" }),
    );
    expect(result).toEqual([]);
    expect(logError).toHaveBeenCalledWith(expect.any(Error), { where: "test" });
  });

  it("rethrows Next.js redirect and not-found errors without logging", () => {
    vi.mocked(logError).mockClear();
    const redirectError = Object.assign(new Error("redirect"), { digest: "NEXT_REDIRECT;/login" });
    expect(() => recoverWithFallback(null, { where: "test" })(redirectError)).toThrow(
      redirectError,
    );
    expect(logError).not.toHaveBeenCalled();
  });
});
