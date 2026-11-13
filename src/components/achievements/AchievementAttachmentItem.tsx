"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { EyeIcon, FileTextIcon, Trash2Icon } from "lucide-react";
import { AttachmentPreviewModal } from "@/components/circulars/AttachmentPreviewModal";
import { Button } from "@/components/ui/button";
import type { AchievementAttachmentRow } from "@/lib/achievements/types";

function AttachmentThumb({
  isImage,
  publicUrl,
  fileName,
}: {
  isImage?: boolean;
  publicUrl: string;
  fileName: string;
}) {
  if (!isImage) return <FileTextIcon className="size-5 shrink-0 text-primary" />;
  return (
    <div className="size-10 shrink-0 overflow-hidden rounded bg-scrim/5">
      <Image
        src={publicUrl}
        alt={fileName}
        width={40}
        height={40}
        unoptimized
        className="size-full object-cover"
      />
    </div>
  );
}

export function AchievementAttachmentItem({
  att,
  canManage,
  isDeleting,
  onDelete,
}: {
  att: AchievementAttachmentRow;
  canManage?: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const tCommon = useTranslations("common");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isImage = att.mime?.startsWith("image/");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/achievement-attachments/${att.path}`;
  const fileName = att.path.split("/").pop() || "attachment";
  const viewLabel = tCommon("view", { defaultValue: "View" });

  return (
    <>
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 p-2 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <AttachmentThumb isImage={isImage} publicUrl={publicUrl} fileName={fileName} />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{fileName}</p>
            {att.size_bytes && (
              <p className="text-[10px] text-muted-foreground" dir="ltr">
                {(att.size_bytes / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsPreviewOpen(true)}
            className="size-7 text-muted-foreground hover:text-foreground"
            title={viewLabel}
            aria-label={viewLabel}
          >
            <EyeIcon className="size-3.5" />
          </Button>
          {canManage && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isDeleting}
              onClick={onDelete}
              className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
              title={tCommon("delete")}
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
      {isPreviewOpen && (
        <AttachmentPreviewModal
          open={isPreviewOpen}
          publicUrl={publicUrl}
          fileName={fileName}
          kind={isImage ? "image" : "pdf"}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
}
