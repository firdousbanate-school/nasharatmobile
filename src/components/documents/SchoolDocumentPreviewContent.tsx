"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalLinkIcon, FileTextIcon } from "lucide-react";
import type { SchoolDocumentRow } from "@/lib/documents/types";

export function SchoolDocumentPreviewContent({
  currentDoc,
}: {
  currentDoc?: SchoolDocumentRow | null;
}) {
  const t = useTranslations("documents");
  const fileUrl = currentDoc?.file_url;
  const isImage = currentDoc?.mime_type?.startsWith("image/");

  if (!currentDoc || !fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <FileTextIcon className="size-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">{t("noDocumentsPublic")}</p>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="flex w-full justify-center">
        <Image
          src={fileUrl}
          alt={currentDoc.title}
          width={1000}
          height={800}
          unoptimized
          className="max-h-[68vh] w-auto max-w-full rounded-lg border border-border/80 object-contain shadow-md"
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-border/80 bg-muted/20 p-6 text-center md:hidden">
        <div className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
          <FileTextIcon className="size-7" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{currentDoc.title}</p>
          <p className="text-xs text-muted-foreground">{t("mobilePdfHint")}</p>
        </div>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 sm:w-auto"
        >
          <ExternalLinkIcon className="size-4" />
          {t("openInNewTab")}
        </a>
      </div>

      <iframe
        src={fileUrl}
        title={currentDoc.title}
        className="hidden h-[68vh] w-full rounded-lg border border-border/80 bg-white md:block"
      />
    </>
  );
}
