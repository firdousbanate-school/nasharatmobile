"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AchievementFormFields } from "./AchievementFormFields";
import { createAchievementAction } from "@/actions/achievements/createAchievementAction";
import { saveAchievementAttachmentsAction } from "@/actions/achievements/saveAchievementAttachmentsAction";
import { uploadMultipleFilesDirectly } from "@/lib/storage/uploadMultipleFilesDirectly";
import type { DepartmentRow } from "@/lib/school/getSchoolDepartments";

export function CreateAchievementForm({
  departments,
  onSuccess,
  onCancel,
}: {
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
      // 1. Create achievement row (no heavy file bytes)
      const res = await createAchievementAction(formData);
      if (!res.success || !res.achievementId) {
        toast.error(res.error ?? tCommon("error"));
        return;
      }

      // 2. Direct-to-storage upload for attachments (bypasses Vercel 4.5 MB limit)
      if (selectedFiles.length > 0) {
        const uploadRes = await uploadMultipleFilesDirectly({
          bucket: "achievement-attachments",
          files: selectedFiles,
        });

        if (!uploadRes.ok) {
          toast.error(uploadRes.error || "Failed to upload attachments");
        } else if (uploadRes.uploaded.length > 0) {
          await saveAchievementAttachmentsAction({
            achievementId: res.achievementId,
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
