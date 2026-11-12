import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { PaperclipIcon } from "lucide-react";
import { CircularPriorityBadge } from "./CircularPriorityBadge";
import { CircularStatusBadge } from "./CircularStatusBadge";
import { formatCircularDate } from "@/lib/circulars/formatCircularDate";
import type { CircularRow } from "@/lib/circulars/types";

/** Phone presentation of one circular (replaces a table row below md). */
export function CircularCard({ circular }: { circular: CircularRow }) {
  const t = useTranslations("circulars");
  const locale = useLocale();
  const publishDate = formatCircularDate(circular.publish_at || circular.created_at, locale);
  const dueDate = formatCircularDate(circular.due_at, locale);
  const attachmentsCount = circular.attachments?.length ?? 0;

  return (
    <Link
      href={`/circulars/${circular.id}`}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xs active:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {circular.ref_number}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <CircularPriorityBadge priority={circular.priority} />
          <CircularStatusBadge status={circular.status} />
        </div>
      </div>
      <p className="line-clamp-2 text-sm font-semibold text-foreground">{circular.title}</p>
      <div
        suppressHydrationWarning
        className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
      >
        <span>
          {t("publishedAt")}: {publishDate}
        </span>
        {circular.due_at ? (
          <span>
            {t("dueDate")}: {dueDate}
          </span>
        ) : null}
        {attachmentsCount > 0 ? (
          <span className="inline-flex items-center gap-0.5">
            <PaperclipIcon className="size-3" />
            {attachmentsCount}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
