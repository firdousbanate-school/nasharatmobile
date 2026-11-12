"use client";

import { useTranslations } from "next-intl";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MaintenancePriorityBadge } from "./MaintenancePriorityBadge";
import { MaintenanceStatusBadge } from "./MaintenanceStatusBadge";
import type { MaintenanceRequestRow } from "@/lib/maintenance/types";

export function MaintenanceDetailHeader({
  ticket,
  onEdit,
  onDelete,
}: {
  ticket: MaintenanceRequestRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="mb-1 font-mono text-sm font-semibold text-primary">
          {ticket.ticket_number}
        </div>
        <h2 className="font-heading text-xl font-extrabold text-primary">{ticket.title}</h2>
        <div className="mt-2 h-0.5 w-24 rounded-full bg-[linear-gradient(90deg,var(--rule-from,#b88a2a),var(--action-to,#0a2f7a))]" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <MaintenancePriorityBadge priority={ticket.priority} />
        <MaintenanceStatusBadge status={ticket.status} />

        <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 text-xs">
          <PencilIcon className="size-3.5" />
          <span>{tCommon("edit", { defaultValue: "Edit" })}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2Icon className="size-3.5" />
          <span>{tCommon("delete", { defaultValue: "Delete" })}</span>
        </Button>
      </div>
    </div>
  );
}
