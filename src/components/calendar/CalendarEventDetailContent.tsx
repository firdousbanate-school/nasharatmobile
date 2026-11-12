"use client";

import { useTransition } from "react";
import { Link } from "@/i18n";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ExternalLinkIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarEventCategoryBadge } from "./CalendarEventCategoryBadge";
import { CalendarEventStatusBadge } from "./CalendarEventStatusBadge";
import { CalendarVisibilityBadge } from "./CalendarVisibilityBadge";
import { CalendarEventImageBanner } from "./CalendarEventImageBanner";
import { CalendarEventMetaGrid } from "./CalendarEventMetaGrid";
import { deleteCalendarEventAction } from "@/actions/calendar/deleteCalendarEventAction";
import type { CalendarEventRow } from "@/lib/calendar/types";

export function CalendarEventDetailContent({
  event,
  canManage = false,
  onClose,
}: {
  event: CalendarEventRow;
  canManage?: boolean;
  onClose: () => void;
}) {
  const tCal = useTranslations("calendar");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        tCommon("confirmDelete", {
          defaultValue: "Are you sure you want to permanently delete this event?",
        }),
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCalendarEventAction(event.id);
      if (res.success) {
        toast.success(tCommon("deleted", { defaultValue: "Deleted successfully" }));
        onClose();
      } else {
        toast.error(res.error || tCommon("error"));
      }
    });
  };

  return (
    <div className="mt-5 space-y-5">
      <CalendarEventImageBanner imagePath={event.image_path} altText={event.title_ar} />
      <div className="flex flex-wrap items-center gap-2">
        <CalendarEventCategoryBadge category={event.category} />
        <CalendarVisibilityBadge visibility={event.visibility} />
        <CalendarEventStatusBadge status={event.status} />
      </div>

      <CalendarEventMetaGrid event={event} />

      {event.description && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {tCal("eventDescription")}
          </h4>
          <p className="rounded-lg border border-border bg-background p-3 text-sm whitespace-pre-wrap text-foreground">
            {event.description}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
        {canManage && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
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
          <Link href={`/calendar/${event.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <PencilIcon className="size-3.5" />
              <span>{tCal("actions.edit")}</span>
            </Button>
          </Link>
        )}

        <Link href={`/calendar/${event.id}`}>
          <Button size="sm" className="gap-1.5 text-xs">
            <ExternalLinkIcon className="size-3.5" />
            <span>{tCal("actions.viewFull")}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
