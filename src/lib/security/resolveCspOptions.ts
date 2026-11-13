import { resolveSafeOrigin } from "./resolveSafeOrigin";

export interface CspOptions {
  isDev?: boolean;
  isPreview?: boolean;
  supabaseUrl?: string;
  errorReportingUrl?: string;
}

export interface ResolvedCspOptions {
  isDev: boolean;
  isPreview: boolean;
  supabaseOrigin: string | null;
  errorReportingOrigin: string | null;
}

/** Normalises optional CSP overrides against runtime environment defaults. */
export function resolveCspOptions(options?: CspOptions): ResolvedCspOptions {
  const isDev = options?.isDev ?? process.env.NODE_ENV === "development";
  const isPreview = options?.isPreview ?? process.env.VERCEL_ENV === "preview";
  const supabaseOrigin = resolveSafeOrigin(
    options?.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const errorReportingOrigin = resolveSafeOrigin(
    options?.errorReportingUrl ?? process.env.ERROR_REPORTING_URL,
  );

  return { isDev, isPreview, supabaseOrigin, errorReportingOrigin };
}
