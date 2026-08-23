import Link from "next/link";
import { requirePermission } from "@/lib/permissions/check";
import { getAuthorsAnalytics } from "@/lib/services/admin-analytics";
import { H1 } from "@/components/ui/typography";
import { AnalyticsTabs } from "@/components/admin/analytics-tabs";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

type AuthorAnalyticsRow = {
  id: string;
  name: string;
  articleCount: number;
  totalViews: number;
} & Record<string, unknown>;

export default async function AdminAuthorsAnalyticsPage() {
  await requirePermission("analytics:view");
  const authors = await getAuthorsAnalytics(20);

  const columns: DataTableColumn<AuthorAnalyticsRow>[] = [
    {
      key: "name",
      header: "Author",
      render: (author) => (
        <Link
          href={`/admin/authors/${author.id}`}
          className="text-foreground hover:text-primary font-medium"
        >
          {author.name}
        </Link>
      ),
    },
    { key: "articleCount", header: "Articles" },
    { key: "totalViews", header: "Views" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Analytics</H1>
      <AnalyticsTabs current="/admin/analytics/authors" />

      {authors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No authors yet"
          description="Author performance will show up here once they publish."
        />
      ) : (
        <DataTable
          columns={columns}
          data={authors}
          getRowId={(author) => author.id}
        />
      )}
    </div>
  );
}
