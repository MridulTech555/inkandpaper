import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NeedsAttentionItem } from "@/lib/services/admin-dashboard";

export function NeedsAttentionList({ items }: { items: NeedsAttentionItem[] }) {
  const active = items.filter((item) => item.count > 0);

  if (active.length === 0) {
    return (
      <div className="border-border bg-surface-elevated flex items-center gap-3 rounded-lg border p-5">
        <CheckCircle2 className="text-success h-5 w-5 shrink-0" />
        <p className="text-foreground-secondary text-sm">
          All caught up — nothing needs your attention right now.
        </p>
      </div>
    );
  }

  return (
    <ul className="border-border divide-border bg-surface-elevated divide-y rounded-lg border">
      {active.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="hover:bg-surface flex items-center justify-between gap-4 px-5 py-3.5 transition-colors"
          >
            <span className="flex items-center gap-3">
              <AlertTriangle className="text-warning h-4 w-4 shrink-0" />
              <span className="text-foreground text-sm font-medium">
                {item.label}
              </span>
            </span>
            <Badge variant="warning">{item.count}</Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}
