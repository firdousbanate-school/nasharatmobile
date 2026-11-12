import { CircularResponseCard } from "./CircularResponseCard";
import type { DepartmentResponseStatus } from "@/lib/circulars/getCircularDepartmentStatuses";

/** Phone list of department responses (replaces the table below md). */
export function CircularResponseCardList({
  items,
  locale,
  statusLabels,
  awaitingText,
  notRespondedText,
}: {
  items: DepartmentResponseStatus[];
  locale: string;
  statusLabels: Record<string, string>;
  awaitingText: string;
  notRespondedText: string;
}) {
  return (
    <div className="flex flex-col gap-2 md:hidden">
      {items.map((item) => (
        <CircularResponseCard
          key={item.departmentId}
          item={item}
          locale={locale}
          statusLabels={statusLabels}
          awaitingText={awaitingText}
          notRespondedText={notRespondedText}
        />
      ))}
    </div>
  );
}
