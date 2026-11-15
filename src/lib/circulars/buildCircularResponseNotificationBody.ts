export function buildCircularResponseNotificationBody(
  circular: { ref_number?: unknown; title?: unknown } | null,
  department: { name?: unknown } | null,
  status: string,
): string {
  return JSON.stringify({
    ref: (circular?.ref_number as string | undefined) ?? "",
    title: (circular?.title as string | undefined) ?? "",
    department: (department?.name as string | undefined) ?? "",
    status,
  });
}
