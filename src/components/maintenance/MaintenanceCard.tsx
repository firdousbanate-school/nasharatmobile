import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n";
import { MapPinIcon } from "lucide-react";
import { MaintenancePriorityBadge } from "./MaintenancePriorityBadge";
import { MaintenanceStatusBadge } from "./MaintenanceStatusBadge";
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
    <Link
      href={`/maintenance/${ticket.id}`}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-xs active:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-primary">{ticket.ticket_number}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          <MaintenancePriorityBadge priority={ticket.priority} />
          <MaintenanceStatusBadge status={ticket.status} />
        </div>
      </div>
      <p className="line-clamp-2 text-sm font-semibold text-foreground">{ticket.title}</p>
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
    </Link>
  );
}
