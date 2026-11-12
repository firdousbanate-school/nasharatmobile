import { buildErrorLogPayload } from "./buildErrorLogPayload";

export type LogContext = Record<string, unknown>;

export function logError(
  error: unknown,
  context?: LogContext,
  correlationId?: string,
): { correlationId: string } {
  const payload = buildErrorLogPayload(error, context, correlationId);

  if (process.env.NODE_ENV !== "test") {
    console.error(JSON.stringify(payload));
  }

  return { correlationId: payload.correlationId };
}
