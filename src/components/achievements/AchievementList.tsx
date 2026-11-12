"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TrophyIcon } from "lucide-react";
import { AchievementCard } from "./AchievementCard";
import { AchievementDetailDialog } from "./AchievementDetailDialog";
import { CreateAchievementDialog } from "./CreateAchievementDialog";
import { deleteAchievementAction } from "@/actions/achievements/deleteAchievementAction";
import type { SchoolAchievementRow } from "@/lib/achievements/types";
import type { DepartmentRow } from "@/lib/school/getSchoolDepartments";

export function AchievementList({
  achievements,
  departments,
  canManage,
}: {
  achievements: SchoolAchievementRow[];
  departments: DepartmentRow[];
  canManage: boolean;
}) {
  const t = useTranslations("achievements");
  const tCommon = useTranslations("common");
  const [selectedAchievement, setSelectedAchievement] = useState<SchoolAchievementRow | null>(null);
  const [, startTransition] = useTransition();

  const handleDelete = (item: SchoolAchievementRow) => {
    if (
      !confirm(
        tCommon("confirmDelete", {
          defaultValue: "Are you sure you want to permanently delete this achievement?",
        }),
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteAchievementAction(item.id);
      if (res.success) {
        toast.success(tCommon("deleted", { defaultValue: "Deleted successfully" }));
      } else {
        toast.error(res.error || tCommon("error"));
      }
    });
  };

  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
        <TrophyIcon className="mb-3 size-12 text-muted-foreground/40" />
        <h3 className="text-base font-bold text-foreground">{t("empty")}</h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("emptyDesc")}</p>
        {canManage && (
          <div className="mt-4">
            <CreateAchievementDialog departments={departments} />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((item) => (
          <AchievementCard
            key={item.id}
            achievement={item}
            canManage={canManage}
            onClick={() => setSelectedAchievement(item)}
            onEdit={() => setSelectedAchievement(item)}
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>

      <AchievementDetailDialog
        achievement={selectedAchievement}
        departments={departments}
        canManage={canManage}
        onClose={() => setSelectedAchievement(null)}
      />
    </>
  );
}
