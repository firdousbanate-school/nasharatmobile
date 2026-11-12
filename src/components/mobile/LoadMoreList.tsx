"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

/** Renders the first `pageSize` items and a "Show more" button. Keeps phone lists short. */
export function LoadMoreList<T>({
  items,
  renderItem,
  pageSize = 10,
  className = "flex flex-col gap-3",
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  pageSize?: number;
  className?: string;
}) {
  const t = useTranslations("mobile");
  const [visible, setVisible] = useState(pageSize);
  const shown = items.slice(0, visible);

  return (
    <div className={className}>
      {shown.map((item) => renderItem(item))}
      {items.length > visible ? (
        <button
          type="button"
          onClick={() => setVisible((v) => v + pageSize)}
          className="min-h-11 w-full rounded-lg border border-input bg-background text-sm font-medium"
        >
          {t("loadMore")} ({t("showing", { shown: shown.length, total: items.length })})
        </button>
      ) : null}
    </div>
  );
}
