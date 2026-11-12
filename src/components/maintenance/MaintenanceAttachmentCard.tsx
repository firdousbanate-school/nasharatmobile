"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalLinkIcon, ImageIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MaintenanceAttachmentRow } from "@/lib/maintenance/types";

export function MaintenanceAttachmentCard({
  att,
  canManage,
  isDeleting,
  onDelete,
}: {
  att: MaintenanceAttachmentRow;
  canManage: boolean;
  isDeleting: boolean;
  onDelete: (id: string, requestId: string) => void;
}) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/30 p-2 transition hover:shadow-sm">
      {att.public_url ? (
        <div className="aspect-video w-full overflow-hidden rounded-md bg-scrim/5">
          <Image
            src={att.public_url}
            alt={att.kind}
            width={400}
            height={225}
            unoptimized
            className="size-full object-cover transition group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
          <ImageIcon className="size-8" />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-xs">
        <Badge variant="outline" className="text-[10px]">
          {att.kind === "report" ? t("reportPhoto") : t("evidencePhoto")}
        </Badge>

        <div className="flex items-center gap-2">
          {att.public_url && (
            <a
              href={att.public_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
              title={tCommon("view", { defaultValue: "View" })}
            >
              <ExternalLinkIcon className="size-3.5" />
            </a>
          )}

          {canManage && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isDeleting}
              onClick={() => onDelete(att.id, att.request_id)}
              className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title={tCommon("delete")}
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
