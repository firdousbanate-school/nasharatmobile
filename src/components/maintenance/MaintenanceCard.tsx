import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { MapPinIcon } from "lucide-react";
import { MaintenancePriorityBadge } from "./MaintenancePriorityBadge";
import { MaintenanceStatusBadge } from "./MaintenanceStatusBadge";
import { MaintenanceRowActions } from "./MaintenanceRowActions";
import { formatLocation } from "@/lib/maintenance/formatLocation";
import type { MaintenanceRequestRow } from "@/lib/maintenance/types";

/** Phone presentation of one maintenance ticket (replaces a table row below md). */
export function MaintenanceCard({ ticket }: { ticket: MaintenanceRequestRow }) {
  const locale = useLocale();
  const tCat = useTranslations("maintenance.categories");
  const categoryLabel = tCat.has(ticket.category)
    ? tCat(ticket.category as never)
    : ticket.category;
  const locationLabel = formatLocation(ticket.location);
  const createdAt = new Date(ticket.created_at).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
  );

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/maintenance/${ticket.id}`}
          className="font-mono text-xs font-semibold text-primary hover:underline"
        >
          {ticket.ticket_number}
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <MaintenancePriorityBadge priority={ticket.priority} />
          <MaintenanceStatusBadge status={ticket.status} />
        </div>
      </div>

      <Link
        href={`/maintenance/${ticket.id}`}
        className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary"
      >
        {ticket.title}
      </Link>

      <div className="flex items-center justify-between border-t border-border/60 pt-2">
        <div
          suppressHydrationWarning
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
        >
          <span>{categoryLabel}</span>
          {locationLabel ? (
            <span className="inline-flex items-center gap-0.5">
              <MapPinIcon className="size-3" />
              {locationLabel}
            </span>
          ) : null}
          <span>{createdAt}</span>
        </div>

        <MaintenanceRowActions ticket={ticket} />
      </div>
    </div>
  );
}
