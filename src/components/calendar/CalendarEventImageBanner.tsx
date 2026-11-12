"use client";

import Image from "next/image";

export function CalendarEventImageBanner({
  imagePath,
  altText,
}: {
  imagePath: string | null;
  altText: string;
}) {
  if (!imagePath) return null;

  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/20 p-1.5">
      <Image
        src={imagePath}
        alt={altText}
        width={1200}
        height={800}
        unoptimized
        className="h-auto max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-xs"
      />
    </div>
  );
}
