"use client";

import { useTranslations } from "next-intl";
import { ArrowRightIcon, FileTextIcon, PaperclipIcon } from "lucide-react";
import { Link } from "@/i18n";
import { formatCircularDate } from "@/lib/circulars/formatCircularDate";
import type { CircularRow } from "@/lib/circulars/types";
import {
  CARD_DIAMOND_ICON,
  CARD_DIAMOND_SM,
  CARD_SHELL,
} from "./publicCardStyles";

export function PublicCircularCard({
  circular,
  locale,
}: {
  circular: CircularRow;
  locale: string;
}) {
  const tHome = useTranslations("home");

  const publishedAt = circular.publish_at ?? circular.created_at;
  const attachmentsCount = circular.attachments?.length ?? 0;

  return (
    <article className={`${CARD_SHELL} h-full w-full justify-between p-6 pt-14 pb-6`}>
      <div className="absolute top-4 start-4 flex items-center gap-1.5">
        <span className="inline-flex items-center rounded-md border border-blue-200/90 bg-blue-50/80 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 shadow-2xs dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
          {circular.ref_number}
        </span>
        {attachmentsCount > 0 && (
          <span
            className="inline-flex items-center gap-1 rounded-md border border-amber-200/90 bg-amber-50/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
            title={tHome("hasAttachments")}
          >
            <PaperclipIcon className="size-3" />
          </span>
        )}
      </div>

      <span className="absolute top-4 end-4 text-[11px] font-medium text-muted-foreground">
        {formatCircularDate(publishedAt, locale)}
      </span>

      <div className={CARD_DIAMOND_SM}>
        <FileTextIcon className={`size-6 ${CARD_DIAMOND_ICON} text-gold`} strokeWidth={2.2} />
      </div>

      <div className="flex w-full flex-1 flex-col items-center text-center">
        <Link href={`/public/circulars/${circular.id}`} className="block">
          <h3 className="line-clamp-2 text-base font-extrabold text-[#0a2f7a] sm:text-lg dark:text-foreground hover:text-primary transition-colors">
            {circular.title}
          </h3>
        </Link>

        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm line-clamp-3">
          {circular.body}
        </p>
      </div>

      <Link
        href={`/public/circulars/${circular.id}`}
        className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0b5cce] px-6 py-2.5 text-xs font-bold text-amber-300 shadow-[0_4px_14px_rgba(11,92,206,0.35),0_2px_0_#ffcd35] transition-all duration-300 hover:scale-[1.03] hover:brightness-110 hover:shadow-[0_6px_20px_rgba(11,92,206,0.45),0_2px_0_#ffcd35] active:scale-95 sm:text-sm"
      >
        <span>{tHome("viewCircularAction")}</span>
        <ArrowRightIcon className="size-4 text-amber-300 rtl:rotate-180" />
      </Link>
    </article>
  );
}
