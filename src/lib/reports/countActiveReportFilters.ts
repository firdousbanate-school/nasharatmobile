import type { ReportFilterState } from "./types";

/** Number of report filters/sorts that differ from their defaults. */
export function countActiveReportFilters(filters: ReportFilterState): number {
  return [
    filters.dateMode !== "all",
    filters.departmentId !== "all",
    filters.dateSort !== "desc",
    filters.departmentSort !== "none",
  ].filter(Boolean).length;
}
