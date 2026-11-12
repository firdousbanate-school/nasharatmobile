"use client";

import { useTranslations } from "next-intl";
import { ClipboardListIcon, HeartHandshakeIcon, UsersIcon } from "lucide-react";
import { MobileMoreLink } from "./MobileMoreLink";

/** "School documents" group in the More sheet (shown only with the documents permission). */
export function MobileMoreDocumentLinks({ onSelect }: { onSelect: () => void }) {
  const t = useTranslations("nav");

  return (
    <>
      <div className="px-2 pt-3 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
        {t("schoolDocuments")}
      </div>
      <MobileMoreLink
        href="/documents/operational-plan"
        label={t("operationalPlan")}
        icon={ClipboardListIcon}
        onSelect={onSelect}
      />
      <MobileMoreLink
        href="/documents/committees-guide"
        label={t("committeesGuide")}
        icon={UsersIcon}
        onSelect={onSelect}
      />
      <MobileMoreLink
        href="/documents/counseling-guide"
        label={t("counselingGuide")}
        icon={HeartHandshakeIcon}
        onSelect={onSelect}
      />
    </>
  );
}
