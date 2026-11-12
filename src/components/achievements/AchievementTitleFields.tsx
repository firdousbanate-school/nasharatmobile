"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AchievementTitleFields({
  defaultTitleAr = "",
  defaultTitleEn = "",
}: {
  defaultTitleAr?: string;
  defaultTitleEn?: string;
}) {
  const t = useTranslations("achievements");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="ach_title_ar">{t("titleAr")} *</Label>
        <Input
          id="ach_title_ar"
          name="title_ar"
          defaultValue={defaultTitleAr}
          required
          placeholder="مثال: المركز الأول في مسابقة الروبوت"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ach_title_en">{t("titleEn")}</Label>
        <Input
          id="ach_title_en"
          name="title_en"
          defaultValue={defaultTitleEn}
          placeholder="e.g. 1st Place Robotics Competition"
        />
      </div>
    </div>
  );
}
