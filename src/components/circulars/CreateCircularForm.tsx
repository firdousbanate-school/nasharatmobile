"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PANEL } from "@/components/ui/diamond-card-styles";
import { createCircularAction } from "@/actions/circulars/createCircularAction";
import { saveDirectCircularAttachmentsAction } from "@/actions/circulars/saveDirectCircularAttachmentsAction";
import { uploadMultipleFilesDirectly } from "@/lib/storage/uploadMultipleFilesDirectly";
import { DepartmentTargetPicker } from "./DepartmentTargetPicker";
import { CircularMetaFields } from "./CircularMetaFields";
import { MultiFileInput } from "@/components/ui/MultiFileInput";
import type { DepartmentRow } from "@/lib/school/getSchoolDepartments";
import { STICKY_ACTION_BAR_CLASS } from "@/components/mobile/stickyActionBarClass";

export function CreateCircularForm({ departments }: { departments: DepartmentRow[] }) {
  const t = useTranslations("circulars");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      // 1. Create circular row
      const res = await createCircularAction(formData);
      if (!res.success || !res.circularId) {
        toast.error(res.error ?? "Failed to create circular");
        return;
      }

      // 2. Direct-to-storage upload for attachments (bypasses Vercel 4.5 MB limit)
      if (selectedFiles.length > 0) {
        const uploadRes = await uploadMultipleFilesDirectly({
          bucket: "circular-attachments",
          files: selectedFiles,
        });

        if (!uploadRes.ok) {
          toast.error(uploadRes.error || "Failed to upload attachments");
        } else if (uploadRes.uploaded.length > 0) {
          await saveDirectCircularAttachmentsAction({
            circularId: res.circularId,
            attachments: uploadRes.uploaded.map((u) => ({
              path: u.path,
              mime: u.mimeType,
              sizeBytes: u.fileSize,
            })),
          });
        }
      }

      toast.success(tCommon("saved"));
      router.push(`/circulars/${res.circularId}`);
    });
  };

  return (
    <form action={handleSubmit} className={`${PANEL} flex flex-col gap-6 p-4 sm:p-8`}>
      <div className="space-y-2">
        <Label htmlFor="title">{t("circularTitle")}</Label>
        <Input id="title" name="title" required placeholder={t("titlePlaceholder")} />
      </div>

      <CircularMetaFields />

      <div className="space-y-2">
        <Label htmlFor="body">{t("circularBody")}</Label>
        <Textarea id="body" name="body" required rows={6} placeholder={t("bodyPlaceholder")} />
      </div>

      <DepartmentTargetPicker departments={departments} label={t("targetedDepartments")} />

      <div className="border-t border-border pt-4">
        <MultiFileInput
          id="circular_documents"
          label={t("uploadDocuments")}
          files={selectedFiles}
          onFilesChange={setSelectedFiles}
          accept="application/pdf,image/jpeg,image/png,image/webp"
        />
      </div>

      <div className={`flex justify-end pt-2 ${STICKY_ACTION_BAR_CLASS}`}>
        <Button type="submit" disabled={isPending} className="gap-2">
          <PlusIcon className="size-4" />
          <span>{t("newCircular")}</span>
        </Button>
      </div>
    </form>
  );
}
