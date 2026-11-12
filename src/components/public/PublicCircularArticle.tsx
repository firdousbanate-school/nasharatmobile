import { useTranslations } from "next-intl";
import { formatCircularDate } from "@/lib/circulars/formatCircularDate";
import type { CircularRow, CircularAttachmentRow, CircularPriority } from "@/lib/circulars/types";
import { PublicCircularAttachments } from "./PublicCircularAttachments";

const PRIORITY_LABEL_KEYS: Record<CircularPriority, string> = {
  urgent: "priorityUrgent",
  high: "priorityHigh",
  normal: "priorityNormal",
  low: "priorityLow",
};

/** The body of a public circular: reference, priority, dates and the text. */
export function PublicCircularArticle({
  circular,
  attachments,
  locale,
}: {
  circular: CircularRow;
  attachments: CircularAttachmentRow[];
  locale: string;
}) {
  const t = useTranslations("circulars");
  const publishedAt = circular.publish_at ?? circular.created_at;

  return (
    <article className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl sm:p-8 dark:border-slate-800 dark:bg-card">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full bg-[#0c1f44] px-3 py-1 text-xs font-bold text-white">
          {circular.ref_number}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
          {t(PRIORITY_LABEL_KEYS[circular.priority])}
        </span>
      </div>

      <h1 className="mt-4 font-heading text-2xl font-black text-[#0c1f44] sm:text-3xl dark:text-white">
        {circular.title}
      </h1>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold text-muted-foreground">{t("publishedAt")}</dt>
          <dd className="mt-1 text-sm font-semibold">{formatCircularDate(publishedAt, locale)}</dd>
        </div>
        {circular.due_at ? (
          <div>
            <dt className="text-xs font-bold text-muted-foreground">{t("dueDate")}</dt>
            <dd className="mt-1 text-sm font-semibold">{formatCircularDate(circular.due_at, locale)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-7 whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
        {circular.body}
      </div>

      <PublicCircularAttachments attachments={attachments} />
    </article>
  );
}
