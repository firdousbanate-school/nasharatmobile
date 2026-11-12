"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { deleteAchievementAttachmentAction } from "@/actions/achievements/deleteAchievementAttachmentAction";
import { AchievementAttachmentItem } from "./AchievementAttachmentItem";
import type { AchievementAttachmentRow } from "@/lib/achievements/types";

export function AchievementAttachmentsList({
  achievementId,
  attachments,
  canManage = false,
}: {
  achievementId: string;
  attachments?: AchievementAttachmentRow[];
  canManage?: boolean;
}) {
  const t = useTranslations("achievements");
  const tCommon = useTranslations("common");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDelete = (attachmentId: string) => {
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
      const res = await deleteAchievementAttachmentAction(attachmentId, achievementId);
      if (res.success) {
        toast.success(tCommon("deleted", { defaultValue: "Attachment deleted" }));
      } else {
        toast.error(res.error || tCommon("error"));
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-2 pt-2">
      <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
        {t("attachments", { defaultValue: "Certificates & Attachments" })} ({attachments.length})
      </h4>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {attachments.map((att) => (
          <AchievementAttachmentItem
            key={att.id}
            att={att}
            canManage={canManage}
            isDeleting={isPending && deletingId === att.id}
            onDelete={() => handleDelete(att.id)}
          />
        ))}
      </div>
    </div>
  );
}
