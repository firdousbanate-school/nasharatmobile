import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/createSupabaseAdminClient";
import { logError } from "@/lib/logger/logError";

/**
 * Cross-instance rate limit backed by the `consume_rate_limit` database function.
 *
 * Returns true while within the limit, false once exceeded, and `null` when the shared store could
 * not be reached (the caller decides how to fail; the in-process limiter still applies).
 * The key is hashed so no IP address or e-mail address is stored in the database.
 */
export async function consumeSharedRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean | null> {
  try {
    const hashedKey = createHash("sha256").update(key).digest("hex");
    const { data, error } = await createSupabaseAdminClient().rpc("consume_rate_limit", {
      p_key: hashedKey,
      p_limit: limit,
      p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
    });

    if (error || typeof data !== "boolean") {
      logError(error ?? new Error("Unexpected consume_rate_limit result"), {
        where: "rateLimit.consumeSharedRateLimit",
      });
      return null;
    }
    return data;
  } catch (error) {
    logError(error, { where: "rateLimit.consumeSharedRateLimit" });
    return null;
  }
}
