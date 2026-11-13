import { resolveCspOptions, type CspOptions } from "./resolveCspOptions";

export interface ContentSecurityPolicyResult {
  nonce: string;
  headerValue: string;
}

/**
 * Generates a cryptographic nonce and constructs a strict Content-Security-Policy (CSP) header.
 * Designed for Next.js App Router and Edge/Node proxy runtimes.
 */
export function buildContentSecurityPolicy(
  customNonce?: string,
  options?: CspOptions,
): ContentSecurityPolicyResult {
  const nonce = customNonce || Buffer.from(crypto.randomUUID()).toString("base64");
  const { isDev, isPreview, supabaseOrigin, errorReportingOrigin } = resolveCspOptions(options);

  const connectSources = Array.from(
    new Set(
      [
        "'self'",
        "https://*.supabase.co",
        "wss://*.supabase.co",
        supabaseOrigin,
        errorReportingOrigin,
      ].filter((s): s is string => Boolean(s)),
    ),
  ).join(" ");

  const imageSources = Array.from(
    new Set(
      ["'self'", "blob:", "data:", "https://*.supabase.co", supabaseOrigin].filter(
        (s): s is string => Boolean(s),
      ),
    ),
  ).join(" ");

  const scriptDirectives = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "'sha256-L7SQsgfZu9ByG5TYbUD49YB6pVJsb0eYrUBcuaszKWs='",
    isDev ? "'unsafe-eval'" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const directives = [
    "default-src 'self'",
    `script-src ${scriptDirectives}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imageSources}`,
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-src 'self'${isPreview ? " https://vercel.live" : ""}`,
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ];

  return {
    nonce,
    headerValue: directives.join("; ").trim(),
  };
}
