import { useTranslations } from "next-intl";
import { CompliancePercentBadge } from "./CompliancePercentBadge";
import { ReportStat } from "./ReportStat";
import type { DepartmentComplianceItem } from "@/lib/reports/types";

/** Phone presentation of one department in the compliance breakdown. */
export function DepartmentComplianceCard({ item }: { item: DepartmentComplianceItem }) {
  const t = useTranslations("reports");

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-foreground">
          {item.departmentName}
        </span>
        <CompliancePercentBadge percent={item.percent} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <ReportStat label={t("table.targeted")}>{item.targeted}</ReportStat>
        <ReportStat label={t("table.responded")}>{item.compliant}</ReportStat>
        <ReportStat label={t("table.pending")}>{item.overdue + item.notYetDue}</ReportStat>
      </div>
    </div>
  );
}
