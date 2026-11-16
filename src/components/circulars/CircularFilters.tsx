"use client";

import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PANEL } from "@/components/ui/diamond-card-styles";
import { CircularFilterControls } from "./CircularFilterControls";
import { FilterSheet } from "@/components/mobile";
import type { DepartmentRow } from "@/lib/school/getSchoolDepartments";
import type { CircularSortField } from "@/lib/circulars/sortCirculars";

export function CircularFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  departmentId,
  onDepartmentChange,
  sortBy,
  onSortByChange,
  departments,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  priority: string;
  onPriorityChange: (v: string) => void;
  departmentId: string;
  onDepartmentChange: (v: string) => void;
  sortBy: CircularSortField;
  onSortByChange: (v: CircularSortField) => void;
  departments: DepartmentRow[];
}) {
  const t = useTranslations("circulars");
  const activeCount = [status, priority, departmentId].filter((v) => v !== "all").length;

  return (
    <div className={`${PANEL} flex flex-col gap-3 p-3 md:p-5`}>
      <div className="flex items-center gap-2 md:gap-3">
        <form onSubmit={(e) => e.preventDefault()} role="search" className="relative flex-1">
          <SearchIcon
            aria-hidden="true"
            className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="ps-9"
          />
        </form>

        <FilterSheet activeCount={activeCount}>
          <CircularFilterControls
            status={status}
            onStatusChange={onStatusChange}
            priority={priority}
            onPriorityChange={onPriorityChange}
            departmentId={departmentId}
            onDepartmentChange={onDepartmentChange}
            sortBy={sortBy}
            onSortByChange={onSortByChange}
            departments={departments}
          />
        </FilterSheet>
      </div>
    </div>
  );
}
