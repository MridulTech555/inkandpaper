import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ArticleStatusBadge } from "@/components/author/article-status-badge";
import { ArticleRowActions } from "@/components/author/article-row-actions";
import { FileText } from "lucide-react";
import type { AuthorArticleListItem } from "@/lib/services/author-articles";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ArticleTable({
  articles,
}: {
  articles: AuthorArticleListItem[];
}) {
  if (articles.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No articles here"
        description="Articles matching this filter will show up here."
      />
    );
  }

  const columns: DataTableColumn<AuthorArticleListItem>[] = [
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
          <ArticleRowActions
            articleId={article.id}
            slug={article.slug}
            isPublished={article.status === "PUBLISHED"}
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
