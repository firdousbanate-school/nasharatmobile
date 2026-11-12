"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { submitMaintenanceEdit } from "./submitMaintenanceEdit";
import { EditMaintenanceTextInputs } from "./EditMaintenanceTextInputs";
import { EditMaintenanceCategoryPriorityFields } from "./EditMaintenanceCategoryPriorityFields";
import { EditMaintenanceLocationFields } from "./EditMaintenanceLocationFields";
import type {
  MaintenanceRequestRow,
  MaintenanceCategory,
  MaintenancePriority,
} from "@/lib/maintenance/types";
import type { LocationRow } from "@/lib/school/getSchoolLocations";

export function EditMaintenanceForm({
  ticket,
  locations,
  onClose,
  onSuccess,
}: {
  ticket: MaintenanceRequestRow;
  locations: LocationRow[];
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const tCommon = useTranslations("common");

  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [category, setCategory] = useState<MaintenanceCategory>(
    (ticket.category as MaintenanceCategory) || "other",
  );
  const [priority, setPriority] = useState<MaintenancePriority>(
    (ticket.priority as MaintenancePriority) || "medium",
  );
  const [area, setArea] = useState(ticket.area ?? "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const locationVal =
      (form.elements.namedItem("location_id") as HTMLSelectElement | null)?.value || null;

    startTransition(async () => {
      await submitMaintenanceEdit({
        requestId: ticket.id,
        title,
        description,
        category,
        priority,
        locationId: locationVal,
        area,
        savedMessage: tCommon("saved"),
        errorMessage: tCommon("error"),
        onSuccess,
        onClose,
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <EditMaintenanceTextInputs
        title={title}
        description={description}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
      />

      <EditMaintenanceCategoryPriorityFields
        category={category}
        priority={priority}
        onCategoryChange={setCategory}
        onPriorityChange={setPriority}
      />

      <EditMaintenanceLocationFields
        locations={locations}
        defaultValue={ticket.location_id}
        area={area}
        onAreaChange={setArea}
      />

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? tCommon("loading") : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
