export function buildCircularPublishBody(ref?: string | null, title?: string | null): string {
  if (ref && title) {
    return JSON.stringify({ ref, title });
  }
  return "circular_published";
}
