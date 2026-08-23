import { requirePermission } from "@/lib/permissions/check";
import {
  getAuditLogEntityOptions,
  getAuditLogs,
} from "@/lib/services/audit-log";
import { H1 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ResultsPagination } from "@/components/blog/results-pagination";
import { ScrollText } from "lucide-react";

const PAGE_SIZE = 25;

type AuditLogEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: unknown;
  createdAt: Date;
  user: { id: string; name: string; email: string } | null;
} & Record<string, unknown>;

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

interface AuditLogsPageProps {
  searchParams: Promise<{ q?: string; entity?: string; page?: string }>;
}

export default async function AdminAuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  await requirePermission("audit:view");
  const { q, entity, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [[logs, total], entities] = await Promise.all([
    getAuditLogs({ search: q, entity }, skip, PAGE_SIZE),
    getAuditLogEntityOptions(),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      key: "user",
      header: "User",
      render: (log) => log.user?.name ?? "System",
    },
    {
      key: "action",
      header: "Action",
      render: (log) => log.action,
    },
    {
      key: "entity",
      header: "Entity",
      render: (log) => `${log.entity} · ${log.entityId.slice(0, 8)}`,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (log) => formatDateTime(log.createdAt),
    },
    {
      key: "metadata",
      header: "Metadata",
      render: (log) =>
        log.metadata ? (
          <code className="text-foreground-muted text-xs">
            {JSON.stringify(log.metadata)}
          </code>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Audit logs</H1>

      <form
        method="GET"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="text-foreground text-sm font-medium">
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Action, entity, or user…"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="entity"
            className="text-foreground text-sm font-medium"
          >
            Entity
          </label>
          <select
            id="entity"
            name="entity"
            defaultValue={entity ?? ""}
            className="border-border text-foreground focus-visible:ring-primary h-10 rounded-md border bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="">All entities</option>
            {entities.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Filter</Button>
      </form>

      {logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit entries"
          description="Admin actions like publishing, moderation, and role changes will show up here."
        />
      ) : (
        <>
          <DataTable columns={columns} data={logs} getRowId={(log) => log.id} />
          <ResultsPagination page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  );
}
