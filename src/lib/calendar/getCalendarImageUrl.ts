import { getClientEnv } from "@/lib/env";

/**
 * Resolves a calendar event's `image_path` (relative Supabase storage key or full URL)
 * into a public URL pointing to the `public-assets` bucket.
 */
export function getCalendarImageUrl(imagePath?: string | null): string | null {
  if (!imagePath || typeof imagePath !== "string") return null;
  const trimmed = imagePath.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const rawBaseUrl = getClientEnv().NEXT_PUBLIC_SUPABASE_URL;
  if (!rawBaseUrl) {
    return trimmed;
  }

  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  let normalized = trimmed.replace(/^\/+/, "");

  if (normalized.startsWith("storage/v1/object/public/")) {
    return `${baseUrl}/${normalized}`;
  }

  if (normalized.startsWith("public-assets/")) {
    normalized = normalized.replace(/^public-assets\//, "");
  }

  return `${baseUrl}/storage/v1/object/public/public-assets/${normalized}`;
}
