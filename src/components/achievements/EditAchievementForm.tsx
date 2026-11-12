"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AchievementFormFields } from "./AchievementFormFields";
import { updateAchievementAction } from "@/actions/achievements/updateAchievementAction";
import { saveAchievementAttachmentsAction } from "@/actions/achievements/saveAchievementAttachmentsAction";
import { uploadMultipleFilesDirectly } from "@/lib/storage/uploadMultipleFilesDirectly";
import type { DepartmentRow } from "@/lib/school/getSchoolDepartments";
import type { SchoolAchievementRow } from "@/lib/achievements/types";

export function EditAchievementForm({
  achievement,
  departments,
  onSuccess,
  onCancel,
}: {
  achievement: SchoolAchievementRow;
  departments: DepartmentRow[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("achievements");
  const tCommon = useTranslations("common");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const res = await updateAchievementAction(achievement.id, formData);
      if (!res.success) {
        toast.error(res.error ?? tCommon("error"));
        return;
      }

      if (selectedFiles.length > 0) {
        const uploadRes = await uploadMultipleFilesDirectly({
          bucket: "achievement-attachments",
          files: selectedFiles,
        });

        if (!uploadRes.ok) {
          toast.error(uploadRes.error || "Failed to upload attachments");
        } else if (uploadRes.uploaded.length > 0) {
          await saveAchievementAttachmentsAction({
            achievementId: achievement.id,
            attachments: uploadRes.uploaded.map((u) => ({
              path: u.path,
              mime: u.mimeType,
              sizeBytes: u.fileSize,
            })),
          });
        }
      }

      toast.success(tCommon("saved"));
      onSuccess();
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5">
      <AchievementFormFields
        departments={departments}
        defaultValues={achievement}
        files={selectedFiles}
        onFilesChange={setSelectedFiles}
      />
      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}
