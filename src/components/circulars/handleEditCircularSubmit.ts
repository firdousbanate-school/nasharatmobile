import { toast } from "sonner";
import { updateCircularAction } from "@/actions/circulars/updateCircularAction";
import { saveDirectCircularAttachmentsAction } from "@/actions/circulars/saveDirectCircularAttachmentsAction";
import { uploadMultipleFilesDirectly } from "@/lib/storage/uploadMultipleFilesDirectly";

export async function handleEditCircularSubmit({
  circularId,
  formData,
  selectedFiles,
  onSuccess,
}: {
  circularId: string;
  formData: FormData;
  selectedFiles: File[];
  onSuccess: () => void;
}): Promise<void> {
  const res = await updateCircularAction(circularId, formData);
  if (!res.success) {
    toast.error(res.error ?? "Failed to update circular");
    return;
  }

  if (selectedFiles.length > 0) {
    const uploadRes = await uploadMultipleFilesDirectly({
      bucket: "circular-attachments",
      files: selectedFiles,
    });

    if (!uploadRes.ok) {
      toast.error(uploadRes.error || "Failed to upload new attachments");
    } else if (uploadRes.uploaded.length > 0) {
      await saveDirectCircularAttachmentsAction({
        circularId,
        attachments: uploadRes.uploaded.map((u) => ({
          path: u.path,
          mime: u.mimeType,
          sizeBytes: u.fileSize,
        })),
      });
    }
  }

  onSuccess();
}
