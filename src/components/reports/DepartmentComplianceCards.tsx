"use client";

import { useTranslations } from "next-intl";
import { LoadMoreList } from "@/components/mobile/LoadMoreList";
import { GoldDots } from "@/components/ui/gold-dots";
import { DepartmentComplianceCard } from "./DepartmentComplianceCard";
import type { DepartmentComplianceItem } from "@/lib/reports/types";

/** Phone version of the department compliance table: a heading and one card per department. */
export function DepartmentComplianceCards({ items }: { items: DepartmentComplianceItem[] }) {
  const t = useTranslations("reports");

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center gap-2.5">
        <h3 className="font-heading text-base font-extrabold text-primary">
          {t("complianceTable")}
        </h3>
        <GoldDots />
      </div>
      <LoadMoreList
        items={items}
        pageSize={8}
        renderItem={(item) => <DepartmentComplianceCard key={item.departmentId} item={item} />}
      />
    </div>
  );
}
