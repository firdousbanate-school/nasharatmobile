import { useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { MaintenancePriorityBadge } from "@/components/maintenance/MaintenancePriorityBadge";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";
import type { MaintenanceReportRow } from "@/lib/reports/types";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="truncate text-xs font-medium text-foreground">{value}</dd>
    </div>
  );
}

/** Phone presentation of one ticket in the report (replaces a table row below md). */
export function MaintenanceReportCard({ row }: { row: MaintenanceReportRow }) {
  const t = useTranslations("reports");

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/maintenance/${row.id}`}
          className="font-mono text-xs font-semibold text-primary hover:underline"
        >
          {row.ticketNumber}
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <MaintenancePriorityBadge priority={row.priority as never} />
          <MaintenanceStatusBadge status={row.status as never} />
        </div>
      </div>
      <p className="line-clamp-2 text-sm font-semibold text-foreground">{row.title}</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
        <Detail label={t("table.location")} value={row.locationName || "—"} />
        <Detail label={t("table.department")} value={row.departmentName ?? "—"} />
        <Detail label={t("table.operator")} value={row.operatorName ?? "—"} />
        <Detail
          label={t("table.hours")}
          value={row.resolutionTimeHours !== null ? `${row.resolutionTimeHours}h` : "—"}
        />
      </dl>
    </div>
  );
}
