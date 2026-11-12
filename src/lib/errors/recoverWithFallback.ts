import { logError, type LogContext } from "../logger/logError";
import { isNextRouterError } from "./isNextRouterError";

/**
 * For OPTIONAL data only: use as `.catch(recoverWithFallback(fallback, { where: "..." }))`.
 * The failure is logged (never silent) and `fallback` is returned. Next.js redirect / not-found
 * errors are rethrown. Do not use for data whose absence would be misread as "empty" (let those
 * errors reach the error boundary instead).
 */
export function recoverWithFallback<T>(fallback: T, context: LogContext): (error: unknown) => T {
  return (error) => {
    if (isNextRouterError(error)) {
      throw error;
    }
    logError(error, context);
    return fallback;
  };
}
