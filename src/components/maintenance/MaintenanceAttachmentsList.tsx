"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { GoldDots } from "@/components/ui/gold-dots";
import { deleteMaintenanceAttachmentAction } from "@/actions/maintenance/deleteMaintenanceAttachmentAction";
import type { MaintenanceAttachmentRow } from "@/lib/maintenance/types";
import { MaintenanceAttachmentCard } from "./MaintenanceAttachmentCard";

export function MaintenanceAttachmentsList({
  attachments,
  canManage = true,
}: {
  attachments: MaintenanceAttachmentRow[];
  canManage?: boolean;
}) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (attachments.length === 0) {
    return null;
  }

  const handleDelete = (attachmentId: string, requestId: string) => {
    if (
      !confirm(
        tCommon("confirmDelete", {
          defaultValue: "Are you sure you want to delete this attachment?",
        }),
      )
    ) {
      return;
    }

    setDeletingId(attachmentId);
    startTransition(async () => {
      const res = await deleteMaintenanceAttachmentAction(attachmentId, requestId);
      if (res.success) {
        toast.success(tCommon("deleted", { defaultValue: "Attachment deleted" }));
      } else {
        toast.error(res.error || tCommon("error"));
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-[0_12px_30px_rgba(20,37,74,.10)]">
      <div className="flex items-center gap-2.5 border-b border-border pb-3">
        <ImageIcon className="size-5 text-primary" />
        <h3 className="font-heading font-extrabold text-primary">{t("attachments")}</h3>
        <GoldDots />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {attachments.map((att) => (
          <MaintenanceAttachmentCard
            key={att.id}
            att={att}
            canManage={canManage}
            isDeleting={isPending && deletingId === att.id}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
