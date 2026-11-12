import { type NextRequest } from "next/server";

export type BypassPayload = {
  secret: string | null;
  clear: boolean;
};

/**
 * Extracts bypass credentials from the `x-bypass-secret` header or a POST JSON body.
 * The secret is intentionally NOT read from the query string: URLs end up in access logs,
 * browser history and referrers. Only the non-sensitive `clear` flag may use the query string.
 */
export async function extractBypassPayload(request: NextRequest): Promise<BypassPayload> {
  const { searchParams } = new URL(request.url);
  const queryClear = searchParams.has("clear");
  const headerSecret = request.headers.get("x-bypass-secret");

  if (request.method === "POST") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      const bodySecret = typeof body.secret === "string" ? body.secret : null;
      return {
        secret: bodySecret ?? headerSecret,
        clear: body.clear === true || queryClear,
      };
    }
  }

  return {
    secret: headerSecret,
    clear: queryClear,
  };
}
