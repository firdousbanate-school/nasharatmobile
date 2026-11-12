"use client";

import { useTranslations } from "next-intl";
import { PaperclipIcon } from "lucide-react";
import { CircularAttachmentItem } from "@/components/circulars/CircularAttachmentItem";
import type { CircularAttachmentRow } from "@/lib/circulars/types";

/** Attachment list of a public circular, with embedded universal viewers. */
export function PublicCircularAttachments({
  attachments,
}: {
  attachments: CircularAttachmentRow[];
}) {
  const t = useTranslations("circulars");

  if (attachments.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
      <h2 className="flex items-center gap-2 font-heading text-sm font-extrabold text-[#0c1f44] dark:text-white mb-4">
        <PaperclipIcon className="size-4" aria-hidden="true" />
        {t("attachments")}
      </h2>
      <div className="space-y-4">
        {attachments.map((attachment) => (
          <CircularAttachmentItem
            key={attachment.id}
            attachment={attachment}
            canManage={false}
            isPending={false}
            onDelete={() => {}}
          />
        ))}
      </div>
    </section>
  );
}
