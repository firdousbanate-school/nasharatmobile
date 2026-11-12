"use client";

import { useTranslations } from "next-intl";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadMoreList } from "@/components/mobile";
import { MaintenanceTableRow } from "./MaintenanceTableRow";
import { MaintenanceCard } from "./MaintenanceCard";
import type { MaintenanceRequestRow } from "@/lib/maintenance/types";

/** Cards (with "Show more") below md, the original table from md up. */
export function MaintenanceTicketResults({ tickets }: { tickets: MaintenanceRequestRow[] }) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");

  return (
    <>
      <div className="md:hidden">
        <LoadMoreList
          items={tickets}
          renderItem={(tk) => <MaintenanceCard key={tk.id} ticket={tk} />}
        />
      </div>
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_12px_30px_rgba(20,37,74,.10)]">
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 bg-[linear-gradient(90deg,var(--topbar-from,var(--sidebar)),var(--topbar-to,var(--sidebar)))] hover:bg-transparent [&_th]:h-11 [&_th]:px-3 [&_th]:font-bold [&_th]:text-sidebar-foreground">
                <TableHead>{t("ticketNumber")}</TableHead>
                <TableHead>{t("ticketTitle")}</TableHead>
                <TableHead>{t("location")}</TableHead>
                <TableHead>{t("priority")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("reporter")}</TableHead>
                <TableHead>{t("createdAt")}</TableHead>
                <TableHead className="text-end">{tCommon("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((tk) => (
                <MaintenanceTableRow key={tk.id} ticket={tk} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
