import { isAppError } from "../errors/isAppError";

export type ErrorDetails = {
  code: string;
  statusCode: number;
  rawMessage: string;
  rawStack?: string;
  correlationId?: string;
};

/**
 * Extracts normalized error details including status code, code string,
 * raw message, stack trace, and correlation ID.
 */
export function resolveErrorDetails(error: unknown): ErrorDetails {
  const isApp = isAppError(error);
  const isErr = error instanceof Error;

  return {
    code: isApp ? error.code : "INTERNAL_ERROR",
    statusCode: isApp ? error.statusCode : 500,
    rawMessage: isErr ? error.message : String(error),
    rawStack: isErr ? error.stack : undefined,
    correlationId: isApp ? error.correlationId : undefined,
  };
}
