import { Badge } from "@/components/ui/badge";
import { prepareResponseRowDisplay } from "@/lib/circulars/prepareResponseRowDisplay";
import type { DepartmentResponseStatus } from "@/lib/circulars/getCircularDepartmentStatuses";

/** Phone presentation of one department response (replaces a table row below md). */
export function CircularResponseCard({
  item,
  locale,
  statusLabels,
  awaitingText,
  notRespondedText,
}: {
  item: DepartmentResponseStatus;
  locale: string;
  statusLabels: Record<string, string>;
  awaitingText: string;
  notRespondedText: string;
}) {
  const row = prepareResponseRowDisplay(item, locale, statusLabels, awaitingText, notRespondedText);

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{row.departmentName}</span>
        <Badge
          variant={row.variant}
          className={
            row.hasResponded
              ? ""
              : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }
        >
          {row.label}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground">
        {row.hasResponded ? (
          row.responder
        ) : (
          <span className="text-muted-foreground/70 italic">{row.responder}</span>
        )}
      </div>
      {row.reason ? <p className="text-xs text-muted-foreground">{row.reason}</p> : null}
      <span suppressHydrationWarning className="font-mono text-[11px] text-muted-foreground">
        {row.formattedDate}
      </span>
    </div>
  );
}
