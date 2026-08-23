import Link from "next/link";
import { requirePermission } from "@/lib/permissions/check";
import { getEngagementAnalytics } from "@/lib/services/admin-analytics";
import { H1 } from "@/components/ui/typography";
import { StatCard } from "@/components/ui/stat-card";
import { AnalyticsTabs } from "@/components/admin/analytics-tabs";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Heart, MessageSquare, Bookmark } from "lucide-react";

type EngagementRow = {
  id: string;
  title: string;
  slug: string;
  _count: { likes: number; comments: number; bookmarks: number };
} & Record<string, unknown>;

export default async function AdminEngagementAnalyticsPage() {
  await requirePermission("analytics:view");
  const engagement = await getEngagementAnalytics();

  const columns: DataTableColumn<EngagementRow>[] = [
    {
      key: "title",
      header: "Article",
      render: (article) => (
        <Link
          href={`/article/${article.slug}`}
          className="text-foreground hover:text-primary font-medium"
        >
          {article.title}
        </Link>
      ),
    },
    { key: "likes", header: "Likes", render: (a) => a._count.likes },
    { key: "comments", header: "Comments", render: (a) => a._count.comments },
    {
      key: "bookmarks",
      header: "Bookmarks",
      render: (a) => a._count.bookmarks,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Analytics</H1>
      <AnalyticsTabs current="/admin/analytics/engagement" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total likes" value={engagement.likes} icon={Heart} />
        <StatCard
          label="Total comments"
          value={engagement.comments}
          icon={MessageSquare}
        />
        <StatCard
          label="Total bookmarks"
          value={engagement.bookmarks}
          icon={Bookmark}
        />
      </div>

      {engagement.topLiked.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No engagement yet"
          description="Likes, comments, and bookmarks will show up here."
        />
      ) : (
        <DataTable
          columns={columns}
          data={engagement.topLiked}
          getRowId={(article) => article.id}
        />
      )}
    </div>
  );
}
