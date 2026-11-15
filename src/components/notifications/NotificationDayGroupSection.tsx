import { NotificationItem } from "./NotificationItem";
import type { NotificationRow } from "@/lib/notifications/types";

export function NotificationDayGroupSection({
  title,
  items,
  onMutated,
}: {
  title: string;
  items: NotificationRow[];
  onMutated: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {title}
      </h2>
      {items.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onMutated={onMutated} />
      ))}
    </section>
  );
}
