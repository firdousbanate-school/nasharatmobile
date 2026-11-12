import { useTranslations } from "next-intl";
import { FileTextIcon, SendIcon, CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { ReportKpiCard } from "./ReportKpiCard";
import type { CircularsReportSummaryData } from "@/lib/reports/types";

export function CircularsReportSummary({ data }: { data: CircularsReportSummaryData }) {
  const t = useTranslations("reports.kpis");

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 pt-8 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4">
      <ReportKpiCard title={t("totalCirculars")} value={data.totalCirculars} icon={FileTextIcon} />
      <ReportKpiCard title={t("publishedCirculars")} value={data.publishedCount} icon={SendIcon} />
      <ReportKpiCard
        title={t("responseRate")}
        value={data.totals.percent === null ? "—" : `${data.totals.percent}%`}
        description={`${data.totals.compliant} / ${data.totals.targeted}`}
        icon={CheckCircle2Icon}
        trend={
          data.totals.percent === null ? "neutral" : data.totals.percent >= 80 ? "good" : "warning"
        }
      />
      <ReportKpiCard
        title={t("overdueResponses")}
        value={data.overdueCount}
        icon={AlertCircleIcon}
        trend={data.overdueCount > 0 ? "warning" : "good"}
      />
    </div>
  );
}
