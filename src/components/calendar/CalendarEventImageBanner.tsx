"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { getCalendarImageUrl } from "@/lib/calendar/getCalendarImageUrl";

export function CalendarEventImageBanner({
  imagePath,
  altText,
}: {
  imagePath: string | null;
  altText: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const resolvedUrl = getCalendarImageUrl(imagePath);

  if (!resolvedUrl) return null;

  if (failedUrl === resolvedUrl) {
    return (
      <div className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-muted-foreground">
        <ImageIcon className="size-8 stroke-1 text-muted-foreground/60" aria-hidden="true" />
        <span className="text-xs">{altText}</span>
      </div>
    );
  }

  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20 p-1.5">
      <Image
        src={resolvedUrl}
        alt={altText}
        width={1200}
        height={800}
        unoptimized
        onError={() => setFailedUrl(resolvedUrl)}
        className="h-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-xs"
      />
    </div>
  );
}
