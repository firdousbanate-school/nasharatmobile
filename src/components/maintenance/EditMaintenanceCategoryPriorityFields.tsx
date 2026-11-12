"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import type { MaintenanceCategory, MaintenancePriority } from "@/lib/maintenance/types";

const CATEGORIES: MaintenanceCategory[] = [
  "electrical",
  "plumbing",
  "hvac",
  "carpentry",
  "cleaning",
  "it",
  "safety",
  "other",
];

const PRIORITIES: MaintenancePriority[] = ["emergency", "urgent", "medium", "deferrable"];

export function EditMaintenanceCategoryPriorityFields({
  category,
  priority,
  onCategoryChange,
  onPriorityChange,
}: {
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  onCategoryChange: (cat: MaintenanceCategory) => void;
  onPriorityChange: (prio: MaintenancePriority) => void;
}) {
  const t = useTranslations("maintenance");
  const tCat = useTranslations("maintenance.categories");
  const tPrio = useTranslations("maintenance.priorities");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="edit-category">{t("category")}</Label>
        <select
          id="edit-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as MaintenanceCategory)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {tCat.has(c) ? tCat(c) : c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-priority">{t("priority")}</Label>
        <select
          id="edit-priority"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as MaintenancePriority)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {tPrio.has(p) ? tPrio(p) : p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
