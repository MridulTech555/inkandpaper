import Link from "next/link";
import { FileText } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ArticleStatusBadge } from "@/components/author/article-status-badge";
import { AdminArticleRowActions } from "@/components/admin/admin-article-row-actions";
import type { AdminArticleListItem } from "@/lib/services/admin-articles";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function AdminArticleTable({
  articles,
}: {
  articles: AdminArticleListItem[];
}) {
  if (articles.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No articles found"
        description="Try adjusting your search or filters."
      />
    );
  }

  const columns: DataTableColumn<AdminArticleListItem>[] = [
    {
      key: "title",
      header: "Title",
      render: (article) => (
        <Link
          href={`/author/articles/${article.id}/edit`}
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
      key: "status",
      header: "Status",
      render: (article) => <ArticleStatusBadge status={article.status} />,
    },
    {
      key: "date",
      header: "Date",
      render: (article) => formatDate(article.publishedAt ?? article.updatedAt),
    },
    {
      key: "views",
      header: "Views",
      render: (article) => article._count.views,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (article) => (
        <div className="flex justify-end">
          <AdminArticleRowActions
            articleId={article.id}
            slug={article.slug}
            status={article.status}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={articles}
      getRowId={(article) => article.id}
    />
  );
}
