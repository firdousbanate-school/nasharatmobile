import { redactSensitiveData } from "./redactSensitiveData";
import { sanitizeLogString } from "./sanitizeLogString";
import { resolveErrorDetails } from "./resolveErrorDetails";

export function buildErrorLogPayload(
  error: unknown,
  context?: Record<string, unknown>,
  correlationId?: string,
) {
  const details = resolveErrorDetails(error);
  const resolvedCorrelationId = correlationId || details.correlationId || `err_${Date.now()}`;
  const isProd = process.env.NODE_ENV === "production";

  return {
    timestamp: new Date().toISOString(),
    level: details.statusCode >= 500 ? "ERROR" : "WARN",
    correlationId: resolvedCorrelationId,
    code: details.code,
    statusCode: details.statusCode,
    message: sanitizeLogString(details.rawMessage),
    context: context ? redactSensitiveData(context) : undefined,
    stack: isProd || !details.rawStack ? undefined : sanitizeLogString(details.rawStack),
  };
}
