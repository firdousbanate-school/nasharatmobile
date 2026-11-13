"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n";
import { toast } from "sonner";
import { restoreBackupAction } from "@/actions/backup";
import { parseBackupFile } from "./parseBackupFile";
import { useRestorePreview } from "./useRestorePreview";
import { uploadRestoredStorageFiles } from "./uploadRestoredStorageFiles";
import { buildRestoreSuccessToast } from "./buildRestoreSuccessToast";
import type { DatabaseBackupPayload } from "@/lib/backup/types";
import type { ExtractedStorageFile } from "./extractStorageFilesFromZip";

export function useRestoreFile() {
  const router = useRouter();
  const t = useTranslations("backup");
  const { diff, isPreviewing, preview, reset: resetPreview } = useRestorePreview();
  const [previewPayload, setPreviewPayload] = useState<DatabaseBackupPayload | null>(null);
  const [storageFiles, setStorageFiles] = useState<ExtractedStorageFile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await parseBackupFile(file);
    if (!result.ok) {
      toast.error(t("invalidFile"));
      resetInput();
      return;
    }

    setPreviewPayload(result.payload);
    setStorageFiles(result.storageFiles || []);
    setIsDialogOpen(true);
    await preview(result.payload);
  };

  const handleConfirmRestore = async () => {
    if (!previewPayload) return;
    try {
      setIsRestoring(true);
      const res = await restoreBackupAction(previewPayload);
      if (!res.success || !res.summary) {
        toast.error(res.error ?? t("restoreError"));
        return;
      }

      let uploadedCount = 0;
      if (storageFiles.length > 0) {
        try {
          uploadedCount = await uploadRestoredStorageFiles(storageFiles);
        } catch (storageErr) {
          console.warn("Storage files upload encountered an issue:", storageErr);
        }
      }

      toast.success(buildRestoreSuccessToast(t, res.summary, uploadedCount));
      closeDialog();
      router.refresh();
    } catch (err: unknown) {
      console.error("Restore failed:", err);
      const message = err instanceof Error ? err.message : t("restoreError");
      toast.error(message);
    } finally {
      setIsRestoring(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setPreviewPayload(null);
    setStorageFiles([]);
    resetPreview();
    resetInput();
  };

  return {
    previewPayload,
    storageFilesCount: storageFiles.length,
    restoreDiff: diff,
    isPreviewing,
    isDialogOpen,
    isRestoring,
    fileInputRef,
    handleFileChange,
    handleConfirmRestore,
    closeDialog,
  };
}
