"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SegmentedTab = { id: string; label: string; content: ReactNode };

/**
 * Phones: one panel at a time, switched with a sticky tab strip.
 * md and up: the strip is hidden and every panel is shown (original desktop layout).
 */
export function SegmentedTabs({
  tabs,
  defaultTabId,
  className,
}: {
  tabs: SegmentedTab[];
  defaultTabId?: string;
  className?: string;
}) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);

  return (
    <div className={cn("flex flex-col gap-4 md:gap-6", className)}>
      <div
        role="tablist"
        className="sticky top-0 z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-border bg-background/95 px-4 backdrop-blur-md md:hidden"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "min-h-11 shrink-0 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          className={cn(tab.id === activeId ? "block" : "hidden md:block")}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
