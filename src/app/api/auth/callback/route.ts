import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { sanitizeNextPath } from "@/lib/auth/sanitizeNextPath";
import { createSupabaseServerClient } from "@/lib/supabase";
import { sanitizeError } from "@/lib/errors/sanitizeError";

const ALLOWED_OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const typeParam = requestUrl.searchParams.get("type");
  // Same-origin relative paths only: `?next=//evil.example` must not become a
  // redirect off the deployment.
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));

  try {
    if (code) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, request.url));
      }
      sanitizeError(error, { endpoint: "/api/auth/callback" });
    } else if (tokenHash && typeParam && ALLOWED_OTP_TYPES.has(typeParam as EmailOtpType)) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: typeParam as EmailOtpType,
      });
      if (!error) {
        return NextResponse.redirect(new URL(next, request.url));
      }
      sanitizeError(error, { endpoint: "/api/auth/callback" });
    }
  } catch (err: unknown) {
    sanitizeError(err, { endpoint: "/api/auth/callback" });
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
}
