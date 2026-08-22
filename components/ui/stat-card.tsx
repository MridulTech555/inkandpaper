import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "border-border bg-surface-elevated flex items-center gap-4 rounded-lg border p-5",
        className,
      )}
    >
      {Icon ? (
        <div className="bg-surface text-foreground-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <div className="flex flex-col">
        <span className="text-foreground text-2xl font-semibold">{value}</span>
        <span className="text-foreground-muted text-sm">{label}</span>
      </div>
    </div>
  );
}
