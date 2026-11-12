import { toast } from "sonner";
import { updateMaintenanceAction } from "@/actions/maintenance/updateMaintenanceAction";
import type { MaintenanceCategory, MaintenancePriority } from "@/lib/maintenance/types";

interface SubmitMaintenanceEditInput {
  requestId: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  locationId?: string | null;
  area?: string;
  savedMessage: string;
  errorMessage: string;
  onSuccess?: () => void;
  onClose: () => void;
}

export async function submitMaintenanceEdit({
  requestId,
  title,
  description,
  category,
  priority,
  locationId,
  area,
  savedMessage,
  errorMessage,
  onSuccess,
  onClose,
}: SubmitMaintenanceEditInput): Promise<void> {
  const res = await updateMaintenanceAction({
    requestId,
    title,
    description,
    category,
    priority,
    locationId,
    area,
  });

  if (res.success) {
    toast.success(savedMessage);
    onSuccess?.();
    onClose();
  } else {
    toast.error(res.error || errorMessage);
  }
}
