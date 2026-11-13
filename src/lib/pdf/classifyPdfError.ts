import type { PdfLoadErrorKind } from "./types";

const STATUS_MAP: Record<number, PdfLoadErrorKind> = {
  401: "unauthorized",
  403: "forbidden",
  404: "notFound",
};

const CORRUPTED_ERROR_NAMES = new Set([
  "InvalidPDFException",
  "FormatError",
  "UnexpectedResponseException",
  "PasswordException",
]);

/**
 * Maps HTTP status codes or PDF.js / fetch errors to a user-facing error category.
 */
export function classifyPdfError(error: unknown): PdfLoadErrorKind {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    if (STATUS_MAP[status]) return STATUS_MAP[status];
  }

  if (error instanceof Error) {
    if (CORRUPTED_ERROR_NAMES.has(error.name)) return "corrupted";
    const lower = error.message.toLowerCase();
    if (lower.includes("invalid pdf") || lower.includes("corrupt")) {
      return "corrupted";
    }
  }

  return "network";
}
