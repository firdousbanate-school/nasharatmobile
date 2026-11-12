import type { ReactNode } from "react";

/** Small labelled number used inside the phone report cards. */
export function ReportStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 rounded-lg bg-muted/50 px-1 py-2 text-center">
      <span className="text-sm font-bold text-foreground">{children}</span>
      <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}
