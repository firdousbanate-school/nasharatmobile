import { cn } from "@/lib/cn";

/** One day in the phone month grid: number plus up to three dots for items on that day. */
export function CalendarMobileDayCell({
  day,
  label,
  isToday,
  isSelected,
  isWeekend = false,
  itemCount,
  onSelect,
}: {
  day: number;
  label: string;
  isToday: boolean;
  isSelected: boolean;
  isWeekend?: boolean;
  itemCount: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={label}
      className={cn(
        "flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-sm font-medium active:bg-muted",
        isWeekend ? "text-amber-600 dark:text-amber-400" : "text-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full",
          isSelected
            ? "bg-primary text-primary-foreground"
            : isToday && "text-primary ring-1 ring-primary",
        )}
      >
        {day}
      </span>
      <span className="flex h-1 gap-0.5" aria-hidden="true">
        {Array.from({ length: Math.min(itemCount, 3) }, (_, i) => (
          <span key={i} className="size-1 rounded-full bg-primary/70" />
        ))}
      </span>
    </button>
  );
}
