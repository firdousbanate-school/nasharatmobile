"use client";

import { useTranslations } from "next-intl";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SchoolDocumentDialogActions({
  onClose,
  isSubmitting,
}: {
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const t = useTranslations("documents");

  return (
    <div className="flex items-center justify-end gap-2.5 border-t border-border/80 pt-3">
      <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
        {t("cancel")}
      </Button>
      <Button type="submit" disabled={isSubmitting} className="min-w-[90px]">
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-1.5 size-4 animate-spin" />
            <span>{t("saving")}</span>
          </>
        ) : (
          <span>{t("save")}</span>
        )}
      </Button>
    </div>
  );
}
