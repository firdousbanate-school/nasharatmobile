"use client";

import { AlertTriangleIcon, LockIcon, RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { PdfLoadErrorKind } from "@/lib/pdf/types";

interface PdfErrorStateProps {
  errorKind: PdfLoadErrorKind;
  onRetry: () => void;
}

const ERROR_MESSAGE_KEY: Record<
  PdfLoadErrorKind,
  "errorUnauthorized" | "errorForbidden" | "errorNotFound" | "errorCorrupted" | "errorNetwork"
> = {
  unauthorized: "errorUnauthorized",
  forbidden: "errorForbidden",
  notFound: "errorNotFound",
  corrupted: "errorCorrupted",
  network: "errorNetwork",
};

export function PdfErrorState({ errorKind, onRetry }: PdfErrorStateProps) {
  const t = useTranslations("pdfViewer");
  const isAccessError = errorKind === "unauthorized" || errorKind === "forbidden";

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        {isAccessError ? <LockIcon className="size-6" /> : <AlertTriangleIcon className="size-6" />}
      </div>

      <p className="max-w-md text-sm font-medium text-foreground">
        {t(ERROR_MESSAGE_KEY[errorKind])}
      </p>

      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="min-h-11 gap-2 md:min-h-9"
      >
        <RefreshCwIcon className="size-4" />
        <span>{t("retry")}</span>
      </Button>
    </div>
  );
}
