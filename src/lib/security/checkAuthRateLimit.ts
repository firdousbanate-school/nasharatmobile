import { consumeRateLimitToken } from "@/lib/rateLimit/consumeRateLimitToken";
import { consumeSharedRateLimit } from "@/lib/rateLimit/consumeSharedRateLimit";

type RateRule = {
  ipLimit: number;
  ipWindowMs: number;
  idLimit: number;
  idWindowMs: number;
};

const RULES: Record<string, RateRule> = {
  login: { ipLimit: 10, ipWindowMs: 60_000, idLimit: 5, idWindowMs: 300_000 },
  password_reset: { ipLimit: 5, ipWindowMs: 300_000, idLimit: 3, idWindowMs: 300_000 },
  owner_claim: { ipLimit: 5, ipWindowMs: 300_000, idLimit: 5, idWindowMs: 300_000 },
};

export type AuthRateLimitOptions = {
  action: "login" | "password_reset" | "owner_claim";
  ip: string;
  identifier?: string;
};

/**
 * Enforces dual-key application-level rate limits (client IP and target account)
 * for sensitive authentication and platform bootstrap operations.
 *
 * Each key is checked in-process first (cheap, per instance) and then in the shared database
 * counter so the limit also holds across serverless instances. If the shared store is
 * unreachable the check fails OPEN (after logging) so a database outage cannot lock every user
 * out; the in-process limit and Supabase Auth's own limits still apply.
 */
export async function checkAuthRateLimit(options: AuthRateLimitOptions): Promise<boolean> {
  const rule = RULES[options.action];
  if (!rule) {
    return true;
  }

  const checks = [
    {
      key: `auth:${options.action}:ip:${options.ip}`,
      limit: rule.ipLimit,
      windowMs: rule.ipWindowMs,
    },
  ];
  if (options.identifier) {
    checks.push({
      key: `auth:${options.action}:id:${options.identifier.trim().toLowerCase()}`,
      limit: rule.idLimit,
      windowMs: rule.idWindowMs,
    });
  }

  for (const { key, limit, windowMs } of checks) {
    if (!consumeRateLimitToken(key, limit, windowMs)) {
      return false;
    }
    if ((await consumeSharedRateLimit(key, limit, windowMs)) === false) {
      return false;
    }
  }

  return true;
}
