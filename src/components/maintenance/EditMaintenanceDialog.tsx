"use client";

import { useTranslations } from "next-intl";
import { XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EditMaintenanceForm } from "./EditMaintenanceForm";
import type { MaintenanceRequestRow } from "@/lib/maintenance/types";
import type { LocationRow } from "@/lib/school/getSchoolLocations";

export function EditMaintenanceDialog({
  isOpen,
  onClose,
  ticket,
  locations,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceRequestRow;
  locations: LocationRow[];
  onSuccess?: () => void;
}) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-lg p-6">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/80 pb-3">
          <DialogTitle className="text-lg font-bold text-foreground">
            {t("editTicketTitle", { defaultValue: "Edit Maintenance Ticket" })}
          </DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={tCommon("close")}>
            <XIcon className="size-4" />
          </Button>
        </DialogHeader>

        <EditMaintenanceForm
          ticket={ticket}
          locations={locations}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
