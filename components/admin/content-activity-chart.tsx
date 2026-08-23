import { EmptyState } from "@/components/ui/empty-state";
import { Activity } from "lucide-react";
import type { ContentActivityDay } from "@/lib/services/admin-dashboard";

export function ContentActivityChart({ days }: { days: ContentActivityDay[] }) {
  const total = days.reduce(
    (sum, day) => sum + day.published + day.submitted,
    0,
  );

  if (total === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Published and submitted articles from the last two weeks will show up here."
      />
    );
  }

  const max = Math.max(...days.map((day) => day.published + day.submitted), 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-40 items-end gap-1.5">
        {days.map((day) => (
          <div
            key={day.date}
            className="group relative flex h-full flex-1 flex-col items-center justify-end gap-0.5"
          >
            <div className="bg-surface flex h-full w-full flex-col-reverse overflow-hidden rounded-sm">
              <div
                className="bg-primary w-full"
                style={{
                  height: `${Math.max(2, (day.published / max) * 100)}%`,
                }}
              />
              <div
                className="bg-info w-full"
                style={{
                  height: `${Math.max(day.submitted > 0 ? 2 : 0, (day.submitted / max) * 100)}%`,
                }}
              />
            </div>
            <span className="text-foreground-muted pointer-events-none absolute -top-6 hidden rounded bg-black/80 px-1.5 py-0.5 text-xs text-white group-hover:block">
              {day.published} published, {day.submitted} submitted
            </span>
          </div>
        ))}
      </div>
      <div className="text-foreground-muted flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="bg-primary h-2 w-2 rounded-full" /> Published
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-info h-2 w-2 rounded-full" /> Submitted
        </span>
      </div>
    </div>
  );
}
