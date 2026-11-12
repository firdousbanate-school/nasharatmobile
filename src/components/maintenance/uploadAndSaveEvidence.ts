import { uploadMultipleFilesDirectly } from "@/lib/storage/uploadMultipleFilesDirectly";
import { saveMaintenanceAttachmentsAction } from "@/actions/maintenance/saveMaintenanceAttachmentsAction";

export async function uploadAndSaveEvidence({
  requestId,
  evidenceFiles,
}: {
  requestId: string;
  evidenceFiles: File[];
}): Promise<{ success: boolean; error?: string }> {
  if (evidenceFiles.length === 0) {
    return { success: true };
  }

  const uploadRes = await uploadMultipleFilesDirectly({
    bucket: "maintenance-photos",
    files: evidenceFiles,
  });

  if (!uploadRes.ok) {
    return { success: false, error: uploadRes.error || "Failed to upload evidence photos" };
  }

  await saveMaintenanceAttachmentsAction({
    requestId,
    kind: "evidence",
    attachments: uploadRes.uploaded.map((u) => ({
      path: u.path,
      mime: u.mimeType,
      sizeBytes: u.fileSize,
    })),
  });

  return { success: true };
}
