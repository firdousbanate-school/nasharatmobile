"use client";

import { useTranslations } from "next-intl";
import { SegmentedTabs, type SegmentedTab } from "@/components/mobile";
import { CircularDetailCard } from "./CircularDetailCard";
import { CircularResponseBox } from "./CircularResponseBox";
import { CircularRemindButton } from "./CircularRemindButton";
import { CircularResponseTable } from "./CircularResponseTable";
import { GoldDots } from "@/components/ui/gold-dots";
import { shouldShowCircularReminder } from "@/lib/circulars/shouldShowCircularReminder";
import type { CircularDetail } from "@/lib/circulars/getCircularById";
import type { CircularResponseRow } from "@/lib/circulars/types";
import type { DepartmentResponseStatus } from "@/lib/circulars/getCircularDepartmentStatuses";

type CircularDetailTabsProps = {
  circular: CircularDetail;
  canPublish: boolean;
  canManage: boolean;
  canRespond: boolean;
  canViewResponses: boolean;
  totalDepartments: number;
  responses: CircularResponseRow[];
  expectedDepartments: DepartmentResponseStatus[];
  userDeptResponse?: CircularResponseRow;
};

/** Details / Your response / Responses: tabs on phones, stacked sections from md up. */
export function CircularDetailTabs(props: CircularDetailTabsProps) {
  const { circular, canPublish, canManage, canRespond, canViewResponses } = props;
  const t = useTranslations("circulars");
  const tMobile = useTranslations("mobile");
  const canRemind = shouldShowCircularReminder(canManage, canPublish, circular.status);

  const tabs: SegmentedTab[] = [
    {
      id: "details",
      label: tMobile("tabDetails"),
      content: (
        <CircularDetailCard
          circular={circular}
          canPublish={canPublish}
          canManage={canManage}
          totalDepartments={props.totalDepartments}
        />
      ),
    },
  ];

  if (canRespond) {
    tabs.push({
      id: "respond",
      label: tMobile("tabRespond"),
      content: (
        <CircularResponseBox
          circularId={circular.id}
          responseType={circular.response_type}
          existingResponse={props.userDeptResponse}
        />
      ),
    });
  }

  if (canViewResponses) {
    tabs.push({
      id: "responses",
      label: t("responses"),
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2.5 font-heading text-lg font-extrabold tracking-tight text-primary">
              <span>{t("responses")}</span>
              <GoldDots />
            </h3>
            {canRemind ? (
              <CircularRemindButton circularId={circular.id} circularTitle={circular.title} />
            ) : null}
          </div>
          <CircularResponseTable
            responses={props.responses}
            expectedDepartments={props.expectedDepartments}
          />
        </div>
      ),
    });
  }

  return <SegmentedTabs tabs={tabs} />;
}
