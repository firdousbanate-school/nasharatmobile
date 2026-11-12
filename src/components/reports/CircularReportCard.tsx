"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "lucide-react";
import { Link } from "@/i18n";
import { CircularPriorityBadge } from "@/components/circulars/CircularPriorityBadge";
import { CircularStatusBadge } from "@/components/circulars/CircularStatusBadge";
import { CircularReportExpandedDepts } from "./CircularReportExpandedDepts";
import { CompliancePercentBadge } from "./CompliancePercentBadge";
import { ReportStat } from "./ReportStat";
import type { CircularReportRow } from "@/lib/reports/types";

/** Phone presentation of one circular in the report (replaces a table row below md). */
export function CircularReportCard({ row }: { row: CircularReportRow }) {
  const t = useTranslations("reports");
  const tCirculars = useTranslations("circulars");
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/circulars/${row.id}`}
          className="font-mono text-xs font-semibold text-primary hover:underline"
        >
          {row.refNumber}
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <CircularPriorityBadge priority={row.priority as never} />
          <CircularStatusBadge status={row.status as never} />
        </div>
      </div>
      <p className="line-clamp-2 text-sm font-semibold text-foreground">{row.title}</p>
      <div className="grid grid-cols-3 gap-2">
        <ReportStat label={t("table.targeted")}>{row.targeted}</ReportStat>
        <ReportStat label={t("table.responded")}>{row.compliant}</ReportStat>
        <ReportStat label={t("table.compliance")}>
          <CompliancePercentBadge percent={row.percent} />
        </ReportStat>
      </div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium text-primary"
      >
        {tCirculars("whoResponded")}
        <ChevronDownIcon
          className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded ? (
        <CircularReportExpandedDepts
          responded={row.respondedDepartments ?? []}
          pending={row.pendingDepartments ?? []}
        />
      ) : null}
    </div>
  );
}
