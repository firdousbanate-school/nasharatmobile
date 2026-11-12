import { AppError } from "./AppError";
import { ConflictError } from "./ConflictError";
import { NotFoundError } from "./NotFoundError";
import { ValidationError } from "./ValidationError";
import { ForbiddenError } from "./ForbiddenError";
import { DatabaseError } from "./DatabaseError";
import { extractDbErrorCode } from "./extractDbErrorCode";

type ErrorFactory = (correlationId?: string) => AppError;

const CODE_ERROR_FACTORIES: Record<string, ErrorFactory> = {
  "23505": (corr) => new ConflictError("A record with this identifier already exists", corr),
  "23503": (corr) => new NotFoundError("A referenced record does not exist", corr),
  "23502": (corr) => new ValidationError("Required field missing", undefined, corr),
  "42501": (corr) => new ForbiddenError("Insufficient permissions to complete operation", corr),
  "22P02": (corr) => new ValidationError("Invalid data format or value", undefined, corr),
  "23514": (corr) => new ValidationError("Data violates validation constraints", undefined, corr),
  PGRST116: (corr) => new NotFoundError("Requested record not found", corr),
};

export function mapDatabaseError(
  error: unknown,
  fallbackMessageOrCorrelationId?: string,
  providedCorrelationId?: string,
): AppError {
  if (error instanceof AppError) return error;

  let fallbackMessage = "Database operation failed";
  let correlationId = providedCorrelationId;

  if (fallbackMessageOrCorrelationId) {
    if (fallbackMessageOrCorrelationId.startsWith("corr_")) {
      correlationId = fallbackMessageOrCorrelationId;
    } else {
      fallbackMessage = fallbackMessageOrCorrelationId;
    }
  }

  const code = extractDbErrorCode(error);
  if (code && CODE_ERROR_FACTORIES[code]) {
    return CODE_ERROR_FACTORIES[code](correlationId);
  }

  return new DatabaseError(fallbackMessage, correlationId, error);
}
