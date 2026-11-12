/**
 * Parent route for a locale-stripped pathname, or null on top-level screens.
 * "/circulars/123/edit" -> "/circulars/123", "/circulars/123" -> "/circulars", "/circulars" -> null.
 */
export function getParentPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  return `/${segments.slice(0, -1).join("/")}`;
}
