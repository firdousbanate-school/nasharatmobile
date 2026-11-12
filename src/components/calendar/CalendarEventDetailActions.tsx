"use client";

import { Link } from "@/i18n";
import { useTranslations } from "next-intl";
import { ExternalLinkIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CalendarEventDetailActions({
  eventId,
  canManage,
  isPending,
  onDelete,
  onClose,
}: {
  eventId: string;
  canManage: boolean;
  isPending: boolean;
  onDelete: () => void;
  onClose: () => void;
}) {
  const tCal = useTranslations("calendar");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
      {canManage && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={isPending}
          className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2Icon className="size-3.5" />
          <span>{tCommon("delete", { defaultValue: "Delete" })}</span>
        </Button>
      )}

      <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
        {tCommon("cancel")}
      </Button>

      {canManage && (
        <Link href={`/calendar/${eventId}/edit`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <PencilIcon className="size-3.5" />
            <span>{tCal("actions.edit")}</span>
          </Button>
        </Link>
      )}

      <Link href={`/calendar/${eventId}`}>
        <Button size="sm" className="gap-1.5 text-xs">
          <ExternalLinkIcon className="size-3.5" />
          <span>{tCal("actions.viewFull")}</span>
        </Button>
      </Link>
    </div>
  );
}
