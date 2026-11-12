"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiFileInput } from "@/components/ui/MultiFileInput";
import { AchievementTitleFields } from "./AchievementTitleFields";
import { AchievementCategoryFields } from "./AchievementCategoryFields";
import type { DepartmentRow } from "@/lib/school/getSchoolDepartments";
import type { SchoolAchievementRow } from "@/lib/achievements/types";

export function AchievementFormFields({
  departments,
  defaultValues,
  files = [],
  onFilesChange,
}: {
  departments: DepartmentRow[];
  defaultValues?: Partial<SchoolAchievementRow>;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
}) {
  const t = useTranslations("achievements");

  return (
    <div className="space-y-4">
      <AchievementTitleFields
        defaultTitleAr={defaultValues?.title_ar}
        defaultTitleEn={defaultValues?.title_en ?? ""}
      />

      <AchievementCategoryFields departments={departments} defaultValues={defaultValues} />

      <div className="space-y-1.5">
        <Label htmlFor="ach_vis">{t("visibility")}</Label>
        <select
          id="ach_vis"
          name="visibility"
          defaultValue={defaultValues?.visibility ?? "internal"}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          <option value="internal">{t("internal")}</option>
          <option value="public">{t("public")}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ach_desc">{t("description")}</Label>
        <Textarea
          id="ach_desc"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          rows={3}
          placeholder="تفاصيل الإنجاز ومضمونه..."
        />
      </div>

      {onFilesChange && (
        <div className="border-t border-border pt-3">
          <MultiFileInput
            id="achievement_attachments"
            label={t("certificate", { defaultValue: "Certificates & Attachments" })}
            files={files}
            onFilesChange={onFilesChange}
            accept="image/jpeg,image/png,image/webp,application/pdf"
          />
        </div>
      )}
    </div>
  );
}
