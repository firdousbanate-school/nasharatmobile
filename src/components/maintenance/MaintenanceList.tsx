"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SearchIcon, WrenchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PANEL } from "@/components/ui/diamond-card-styles";
import { MaintenanceTicketResults } from "./MaintenanceTicketResults";
import { Fab } from "@/components/mobile";
import { MaintenanceListHeader } from "./MaintenanceListHeader";
import { filterMaintenanceTickets } from "@/lib/maintenance/filterMaintenanceTickets";
import type { MaintenanceRequestRow } from "@/lib/maintenance/types";

export function MaintenanceList({
  tickets,
  canCreate,
}: {
  tickets: MaintenanceRequestRow[];
  canCreate: boolean;
}) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTickets = tickets.filter((tk) =>
    filterMaintenanceTickets(tk, search, statusFilter),
  );

  return (
    <div className="space-y-4 max-md:pb-20 md:space-y-6">
      <MaintenanceListHeader canCreate={canCreate} />

      <div
        className={`${PANEL} flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute start-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tCommon("search")}
            className="ps-9"
          />
        </div>

        <div className="-mx-1 flex min-w-0 gap-1.5 overflow-x-auto px-1 md:mx-0 md:flex-wrap md:px-0">
          {["all", "emergency", "in_progress", "resolved", "closed"].map((f) => (
            <Button
              key={f}
              variant={statusFilter === f ? "default" : "outline"}
              size="sm"
              className="shrink-0 max-md:h-9"
              onClick={() => setStatusFilter(f)}
            >
              {f === "all"
                ? t("filterAll")
                : f === "emergency"
                  ? t("priorities.emergency")
                  : t(`statuses.${f}`)}
            </Button>
          ))}
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-[color:var(--panel,var(--card))] p-8 text-center md:p-12">
          <WrenchIcon className="mb-3 size-10 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">{t("noTickets")}</p>
        </div>
      ) : (
        <MaintenanceTicketResults tickets={filteredTickets} />
      )}
      {canCreate ? <Fab href="/maintenance/new" label={t("submitTicket")} /> : null}
    </div>
  );
}
