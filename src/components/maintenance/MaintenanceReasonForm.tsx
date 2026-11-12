"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiFileInput } from "@/components/ui/MultiFileInput";
import { uploadAndSaveEvidence } from "./uploadAndSaveEvidence";
import type { MaintenanceStatus } from "@/lib/maintenance/types";

export function MaintenanceReasonForm({
  requestId,
  activeAction,
  isPending,
  onCancel,
  onSubmit,
}: {
  requestId: string;
  activeAction: MaintenanceStatus;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (activeAction === "resolved" && evidenceFiles.length > 0) {
      setIsUploading(true);
      const res = await uploadAndSaveEvidence({ requestId, evidenceFiles });
      setIsUploading(false);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
    }

    onSubmit(formData);
  };

  const busy = isPending || isUploading;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-md border border-border bg-muted/40 p-4"
    >
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="target_status" value={activeAction} />

      <div className="space-y-1.5">
        <Label htmlFor="reason">
          {activeAction === "resolved"
            ? t("actions.evidenceUpload")
            : t("actions.reasonPlaceholder")}{" "}
          *
        </Label>
        <Input
          id="reason"
          name="reason"
          required={activeAction === "rejected" || activeAction === "reopened"}
          placeholder={t("actions.reasonPlaceholder")}
        />
      </div>

      {activeAction === "resolved" && (
        <div className="space-y-1.5 pt-2">
          <MultiFileInput
            id="evidence_photos"
            label={t("evidencePhoto")}
            files={evidenceFiles}
            onFilesChange={setEvidenceFiles}
            accept="image/jpeg,image/png,image/webp,application/pdf"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={busy}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? tCommon("loading") : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
