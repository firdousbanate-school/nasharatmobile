import type { RestoreSummary } from "@/lib/backup/types";

type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

export function buildRestoreSuccessToast(
  t: TranslateFn,
  summary: RestoreSummary,
  storageCount: number,
): string {
  const tableCount = Object.keys(summary.tableCounts).length;

  if (storageCount > 0) {
    return t("restoreSuccessWithStorage", {
      count: summary.totalRecords,
      tables: tableCount,
      files: storageCount,
      id: summary.snapshotId || "N/A",
    });
  }

  if (summary.snapshotId) {
    return t("restoreSuccessWithSnapshot", {
      count: summary.totalRecords,
      tables: tableCount,
      id: summary.snapshotId,
    });
  }

  return t("restoreSuccess", {
    count: summary.totalRecords,
    tables: tableCount,
  });
}
