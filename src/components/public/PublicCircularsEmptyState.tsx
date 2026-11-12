"use client";

import { useTranslations } from "next-intl";
import { FileTextIcon } from "lucide-react";

export function PublicCircularsEmptyState() {
  const t = useTranslations("home");

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 text-center space-y-3">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileTextIcon className="size-6" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{t("noPublicCirculars")}</p>
    </div>
  );
}
