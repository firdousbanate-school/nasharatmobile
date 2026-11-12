/**
 * Sanitizes arbitrary log strings by redacting bearer tokens, database
 * connection credentials, and email addresses to avoid PII / secret leakage.
 */
export function sanitizeLogString(val: string): string {
  if (!val || typeof val !== "string") {
    return "";
  }

  return val
    .replace(/Bearer\s+[A-Za-z0-9-_=.]+/gi, "Bearer [REDACTED]")
    .replace(/(:\/\/[^:]+:)[^@]+(@)/g, "$1[REDACTED]$2")
    .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, "[REDACTED_EMAIL]");
}
