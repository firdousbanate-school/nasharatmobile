import { createMaintenanceAction } from "@/actions/maintenance/createMaintenanceAction";
import { saveMaintenanceAttachmentsAction } from "@/actions/maintenance/saveMaintenanceAttachmentsAction";
import { uploadMultipleFilesDirectly } from "@/lib/storage/uploadMultipleFilesDirectly";

interface HandleCreateMaintenanceInput {
  formData: FormData;
  selectedFiles: File[];
}

export async function handleCreateMaintenanceSubmit({
  formData,
  selectedFiles,
}: HandleCreateMaintenanceInput): Promise<{
  success: boolean;
  requestId?: string;
  error?: string;
}> {
  const res = await createMaintenanceAction(formData);
  if (!res.success || !res.requestId) {
    return { success: false, error: res.error };
  }

  if (selectedFiles.length > 0) {
    const uploadRes = await uploadMultipleFilesDirectly({
      bucket: "maintenance-photos",
      files: selectedFiles,
    });

    if (uploadRes.ok && uploadRes.uploaded.length > 0) {
      await saveMaintenanceAttachmentsAction({
        requestId: res.requestId,
        kind: "report",
        attachments: uploadRes.uploaded.map((u) => ({
          path: u.path,
          mime: u.mimeType,
          sizeBytes: u.fileSize,
        })),
      });
    }
  }

  return { success: true, requestId: res.requestId };
}
