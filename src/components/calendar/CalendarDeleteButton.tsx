"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCalendarEventAction } from "@/actions/calendar/deleteCalendarEventAction";

export function CalendarDeleteButton({ eventId }: { eventId: string }) {
  const tCommon = useTranslations("common");
  const router = useRouter();
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
      const res = await deleteCalendarEventAction(eventId);
      if (res.success) {
        toast.success(tCommon("deleted", { defaultValue: "Deleted successfully" }));
        router.push("/calendar");
      } else {
        toast.error(res.error || tCommon("error"));
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
      className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      <Trash2Icon className="size-3.5" />
      <span>{tCommon("delete", { defaultValue: "Delete" })}</span>
    </Button>
  );
}
