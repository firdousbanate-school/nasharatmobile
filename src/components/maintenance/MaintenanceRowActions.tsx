"use client";

import { useState } from "react";
import { Link } from "@/i18n";
import { useTranslations } from "next-intl";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MaintenanceDeleteDialog } from "./MaintenanceDeleteDialog";
import { EditMaintenanceDialog } from "./EditMaintenanceDialog";
import type { MaintenanceRequestRow } from "@/lib/maintenance/types";
import type { LocationRow } from "@/lib/school/getSchoolLocations";

export function MaintenanceRowActions({
  ticket,
  locations = [],
  onDeleted,
}: {
  ticket: MaintenanceRequestRow;
  locations?: LocationRow[];
  onDeleted?: () => void;
}) {
  const t = useTranslations("common");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Link href={`/maintenance/${ticket.id}`}>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8"
            title={t("view", { defaultValue: "View" })}
          >
            <EyeIcon className="size-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8"
          title={t("edit", { defaultValue: "Edit" })}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsEditOpen(true);
          }}
        >
          <PencilIcon className="size-4 text-muted-foreground hover:text-foreground" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          title={t("delete", { defaultValue: "Delete" })}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDeleteOpen(true);
          }}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>

      {isEditOpen && (
        <EditMaintenanceDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          ticket={ticket}
          locations={locations}
        />
      )}

      {isDeleteOpen && (
        <MaintenanceDeleteDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          requestId={ticket.id}
          ticketNumber={ticket.ticket_number}
          onSuccess={onDeleted}
        />
      )}
    </>
  );
}
