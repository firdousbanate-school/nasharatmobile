"use client";

import { useTranslations } from "next-intl";
import { SegmentedTabs, type SegmentedTab } from "@/components/mobile";
import { DashboardComplianceWidget } from "./DashboardComplianceWidget";
import { DashboardRecentCirculars } from "./DashboardRecentCirculars";
import { DashboardRecentMaintenance } from "./DashboardRecentMaintenance";
import { DashboardAchievementsWidget } from "./DashboardAchievementsWidget";
import type { DashboardComplianceData } from "@/lib/dashboard/types";
import type { CircularRow } from "@/lib/circulars/types";
import type { MaintenanceRequestRow } from "@/lib/maintenance/types";
import type { SchoolAchievementRow } from "@/lib/achievements/types";

/** Phone-only dashboard body: the long widget stack is split into tabs (shown below md). */
export function DashboardMobileSections({
  complianceData,
  circulars,
  maintenance,
  achievements,
  isOwner,
}: {
  complianceData: DashboardComplianceData | null;
  circulars: CircularRow[];
  maintenance: MaintenanceRequestRow[];
  achievements: SchoolAchievementRow[];
  isOwner: boolean;
}) {
  const t = useTranslations("mobile");

  const tabs: SegmentedTab[] = [
    ...(complianceData
      ? [
          {
            id: "compliance",
            label: t("tabCompliance"),
            content: <DashboardComplianceWidget data={complianceData} />,
          },
        ]
      : []),
    {
      id: "circulars",
      label: t("tabCirculars"),
      content: <DashboardRecentCirculars circulars={circulars} />,
    },
    {
      id: "maintenance",
      label: t("tabMaintenance"),
      content: <DashboardRecentMaintenance requests={maintenance} />,
    },
    ...(isOwner
      ? [
          {
            id: "achievements",
            label: t("tabAchievements"),
            content: <DashboardAchievementsWidget achievements={achievements} />,
          },
        ]
      : []),
  ];

  return (
    <div className="md:hidden">
      <SegmentedTabs tabs={tabs} />
    </div>
  );
}
