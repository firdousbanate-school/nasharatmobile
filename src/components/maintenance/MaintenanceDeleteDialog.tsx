"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteMaintenanceAction } from "@/actions/maintenance/deleteMaintenanceAction";

export function MaintenanceDeleteDialog({
  isOpen,
  onClose,
  requestId,
  ticketNumber,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  ticketNumber?: string;
  onSuccess?: () => void;
}) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteMaintenanceAction(requestId);
      if (res.success) {
        toast.success(tCommon("deleted", { defaultValue: "Deleted successfully" }));
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.error || tCommon("error"));
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {t("deleteTicketTitle", { defaultValue: "Delete Maintenance Ticket" })}
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm">
            {t("deleteTicketPrompt", {
              defaultValue:
                "Are you sure you want to permanently delete this maintenance ticket and all its attachments?",
            })}
            {ticketNumber ? ` (${ticketNumber})` : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            {tCommon("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? tCommon("loading") : tCommon("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
