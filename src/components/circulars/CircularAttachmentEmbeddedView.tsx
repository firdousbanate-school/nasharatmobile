"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { DownloadIcon, ExternalLinkIcon, FileTextIcon, ZoomInIcon } from "lucide-react";
import type { AttachmentKind } from "@/lib/circulars/getAttachmentKind";

export function CircularAttachmentEmbeddedView({
  publicUrl,
  fileName,
  kind,
  onExpand,
}: {
  publicUrl?: string;
  fileName: string;
  kind: AttachmentKind;
  onExpand: () => void;
}) {
  const t = useTranslations("circulars");
  if (!publicUrl) return null;

  if (kind === "image") {
    return (
      <div
        onClick={onExpand}
        className="group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20 p-2 transition-colors hover:border-primary/50"
      >
        <Image
          src={publicUrl}
          alt={fileName}
          width={800}
          height={600}
          unoptimized
          className="max-h-[550px] w-auto max-w-full rounded-md object-contain transition-transform duration-200 group-hover:scale-[1.005]"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-scrim/25 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
            <ZoomInIcon className="size-3.5" />
            {t("expandAttachment")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex flex-col items-center justify-center gap-4 p-6 text-center md:hidden">
        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <FileTextIcon className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground">{t("mobilePdfHint")}</p>
        </div>
        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            <ExternalLinkIcon className="size-4" />
            {t("openInNewTab")}
          </a>
          <a
            href={publicUrl}
            download={fileName}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-accent"
          >
            <DownloadIcon className="size-4" />
            {t("download")}
          </a>
        </div>
      </div>

      <iframe
        src={publicUrl}
        title={fileName}
        className="hidden h-[600px] w-full border-0 bg-background md:block"
      />
    </div>
  );
}
