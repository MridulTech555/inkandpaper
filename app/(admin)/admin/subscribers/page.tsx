import { Mail } from "lucide-react";
import { requirePermission } from "@/lib/permissions/check";
import {
  getNewsletterSubscriberCounts,
  getNewsletterSubscribers,
} from "@/lib/services/newsletter";
import { H1 } from "@/components/ui/typography";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

type SubscriberStatus = "SUBSCRIBED" | "UNSUBSCRIBED";

type SubscriberRow = {
  id: string;
  email: string;
  status: SubscriberStatus;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
} & Record<string, unknown>;

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

interface AdminSubscribersPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function AdminSubscribersPage({
  searchParams,
}: AdminSubscribersPageProps) {
  await requirePermission("analytics:view");
  const { q, status } = await searchParams;
  const validStatus =
    status === "SUBSCRIBED" || status === "UNSUBSCRIBED" ? status : undefined;

  const [subscribers, counts] = await Promise.all([
    getNewsletterSubscribers({ search: q, status: validStatus }),
    getNewsletterSubscriberCounts(),
  ]);

  const columns: DataTableColumn<SubscriberRow>[] = [
    { key: "email", header: "Email" },
    {
      key: "status",
      header: "Status",
      render: (subscriber) => (
        <Badge
          variant={subscriber.status === "SUBSCRIBED" ? "success" : "outline"}
        >
          {subscriber.status}
        </Badge>
      ),
    },
    {
      key: "subscribedAt",
      header: "Subscribed",
      render: (subscriber) => formatDate(subscriber.subscribedAt),
    },
    {
      key: "unsubscribedAt",
      header: "Unsubscribed",
      render: (subscriber) => formatDate(subscriber.unsubscribedAt),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Subscribers</H1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Subscribed" value={counts.subscribed} icon={Mail} />
        <StatCard
          label="Unsubscribed"
          value={counts.unsubscribed}
          icon={Mail}
        />
      </div>

      <form
        method="GET"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="text-foreground text-sm font-medium">
            Search
          </label>
          <Input id="q" name="q" defaultValue={q} placeholder="Search email…" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="status"
            className="text-foreground text-sm font-medium"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="border-border text-foreground focus-visible:ring-primary h-10 rounded-md border bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="">All statuses</option>
            <option value="SUBSCRIBED">Subscribed</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>
        </div>
        <Button type="submit">Filter</Button>
      </form>

      {subscribers.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No subscribers found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <DataTable
          columns={columns}
          data={subscribers}
          getRowId={(subscriber) => subscriber.id}
        />
      )}
    </div>
  );
}
