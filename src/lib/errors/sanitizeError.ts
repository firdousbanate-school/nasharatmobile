import { AppError } from "./AppError";
import { ERROR_CODES } from "./errorCodes";
import { mapDatabaseError } from "./mapDatabaseError";
import { createCorrelationId } from "../logger/createCorrelationId";
import { logError, type LogContext } from "../logger/logError";

import { isNextRouterError } from "./isNextRouterError";

export function sanitizeError(
  error: unknown,
  context?: LogContext,
  providedCorrelationId?: string,
): AppError {
  if (isNextRouterError(error)) {
    throw error;
  }

  const correlationId = providedCorrelationId || createCorrelationId();

  let resolvedAppError: AppError;

  if (error instanceof AppError) {
    if (!error.correlationId) {
      (error as { correlationId?: string }).correlationId = correlationId;
    }
    resolvedAppError = error;
  } else if (typeof error === "object" && error !== null && "code" in error) {
    resolvedAppError = mapDatabaseError(error, correlationId);
  } else if (error instanceof Error) {
    const isProd = process.env.NODE_ENV === "production";
    const userMessage = isProd
      ? "An unexpected error occurred. Please try again later."
      : error.message;

    resolvedAppError = new AppError(userMessage, {
      code: ERROR_CODES.INTERNAL_ERROR,
      statusCode: 500,
      isOperational: false,
      correlationId,
      cause: error,
    });
  } else {
    resolvedAppError = new AppError("An unexpected error occurred", {
      code: ERROR_CODES.INTERNAL_ERROR,
      statusCode: 500,
      isOperational: false,
      correlationId,
    });
  }

  logError(error, context, correlationId);

  return resolvedAppError;
}
