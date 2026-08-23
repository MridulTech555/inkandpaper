import { EmptyState } from "@/components/ui/empty-state";
import { TrendingUp } from "lucide-react";

export function SimpleLineChart({
  data,
  label,
}: {
  data: { date: string; value: number }[];
  label: string;
}) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  if (total === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title={`No ${label.toLowerCase()} yet`}
        description="Data will show up here once readers start visiting."
      />
    );
  }

  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((point) => (
        <div
          key={point.date}
          className="group relative flex h-full flex-1 flex-col items-center justify-end"
        >
          <div
            className="bg-primary w-full rounded-sm"
            style={{ height: `${Math.max(2, (point.value / max) * 100)}%` }}
          />
          <span className="text-foreground-muted pointer-events-none absolute -top-6 hidden rounded bg-black/80 px-1.5 py-0.5 text-xs text-white group-hover:block">
            {point.date}: {point.value}
          </span>
        </div>
      ))}
    </div>
  );
}
