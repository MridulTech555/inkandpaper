import { requirePermission } from "@/lib/permissions/check";
import { getArticlesAnalytics } from "@/lib/services/admin-analytics";
import { H1 } from "@/components/ui/typography";
import { AnalyticsTabs } from "@/components/admin/analytics-tabs";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";
import Link from "next/link";

type ArticleAnalyticsRow = {
  id: string;
  title: string;
  slug: string;
  author: { name: string };
  category: { name: string } | null;
  _count: { views: number; likes: number; comments: number };
} & Record<string, unknown>;

export default async function AdminArticlesAnalyticsPage() {
  await requirePermission("analytics:view");
  const articles = await getArticlesAnalytics(20);

  const columns: DataTableColumn<ArticleAnalyticsRow>[] = [
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
    {
      key: "author",
      header: "Author",
      render: (article) => article.author.name,
    },
    {
      key: "category",
      header: "Category",
      render: (article) => article.category?.name ?? "—",
    },
    {
      key: "views",
      header: "Views",
      render: (article) => article._count.views,
    },
    {
      key: "likes",
      header: "Likes",
      render: (article) => article._count.likes,
    },
    {
      key: "comments",
      header: "Comments",
      render: (article) => article._count.comments,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Analytics</H1>
      <AnalyticsTabs current="/admin/analytics/articles" />

      {articles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No published articles yet"
          description="Once articles are published, their performance shows up here."
        />
      ) : (
        <DataTable
          columns={columns}
          data={articles}
          getRowId={(article) => article.id}
        />
      )}
    </div>
  );
}
