"use client";

import { LoadMoreList } from "@/components/mobile/LoadMoreList";
import { MaintenanceReportCard } from "./MaintenanceReportCard";
import type { MaintenanceReportRow } from "@/lib/reports/types";

/** Phone list of report tickets, with "Show more" to keep the page short. */
export function MaintenanceReportCards({ rows }: { rows: MaintenanceReportRow[] }) {
  return (
    <div className="md:hidden">
      <LoadMoreList
        items={rows}
        renderItem={(row) => <MaintenanceReportCard key={row.id} row={row} />}
      />
    </div>
  );
}
