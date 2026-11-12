"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircleIcon } from "lucide-react";
import { MaintenanceDetailMetaGrid } from "./MaintenanceDetailMetaGrid";
import { EditMaintenanceDialog } from "./EditMaintenanceDialog";
import { MaintenanceDeleteDialog } from "./MaintenanceDeleteDialog";
import { MaintenanceDetailHeader } from "./MaintenanceDetailHeader";
import { GoldDots } from "@/components/ui/gold-dots";
import type { MaintenanceRequestRow } from "@/lib/maintenance/types";

export function MaintenanceDetailCard({ ticket }: { ticket: MaintenanceRequestRow }) {
  const t = useTranslations("maintenance");
  const locale = useLocale();
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="relative space-y-6 overflow-hidden rounded-xl border border-border bg-card p-6 pt-8 shadow-[0_12px_30px_rgba(20,37,74,.10)]">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,var(--action-from,#0b63d6),var(--action-to,#0a2f7a))]"
      />

      <MaintenanceDetailHeader
        ticket={ticket}
        onEdit={() => setIsEditOpen(true)}
        onDelete={() => setIsDeleteOpen(true)}
      />

      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-xs font-extrabold text-primary">
          {t("ticketDescription")}
          <GoldDots />
        </h3>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {ticket.description}
        </p>
      </div>

      {ticket.rejection_reason && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <div className="mb-1 flex items-center gap-2 font-medium">
            <AlertCircleIcon className="size-4" />
            <span>{t("rejectionReason")}</span>
          </div>
          <p>{ticket.rejection_reason}</p>
        </div>
      )}

      {ticket.reopen_reason && (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
          <div className="mb-1 flex items-center gap-2 font-medium">
            <AlertCircleIcon className="size-4" />
            <span>{t("reopenReason")}</span>
          </div>
          <p>{ticket.reopen_reason}</p>
        </div>
      )}

      <MaintenanceDetailMetaGrid ticket={ticket} />

      {isEditOpen && (
        <EditMaintenanceDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          ticket={ticket}
          locations={[]}
          onSuccess={() => router.refresh()}
        />
      )}

      {isDeleteOpen && (
        <MaintenanceDeleteDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          requestId={ticket.id}
          ticketNumber={ticket.ticket_number}
          onSuccess={() => router.push(`/${locale}/maintenance`)}
        />
      )}
    </div>
  );
}
