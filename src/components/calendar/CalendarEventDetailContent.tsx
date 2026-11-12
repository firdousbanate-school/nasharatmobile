"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CalendarEventCategoryBadge } from "./CalendarEventCategoryBadge";
import { CalendarEventStatusBadge } from "./CalendarEventStatusBadge";
import { CalendarVisibilityBadge } from "./CalendarVisibilityBadge";
import { CalendarEventImageBanner } from "./CalendarEventImageBanner";
import { CalendarEventMetaGrid } from "./CalendarEventMetaGrid";
import { CalendarEventDetailActions } from "./CalendarEventDetailActions";
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

      <CalendarEventDetailActions
        eventId={event.id}
        canManage={canManage}
        isPending={isPending}
        onDelete={handleDelete}
        onClose={onClose}
      />
    </div>
  );
}
