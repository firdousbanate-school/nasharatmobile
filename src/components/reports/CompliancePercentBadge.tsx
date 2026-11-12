/** Colored compliance percentage pill (green 80+, amber 50+, red below, muted when unknown). */
export function CompliancePercentBadge({ percent }: { percent: number | null }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
        percent === null
          ? "bg-muted text-muted-foreground"
          : percent >= 80
            ? "bg-success/15 text-success"
            : percent >= 50
              ? "bg-warning/15 text-warning"
              : "bg-destructive/15 text-destructive"
      }`}
    >
      {percent === null ? "—" : `${percent}%`}
    </span>
  );
}
