import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { TopArticleEntry } from "@/lib/services/admin-dashboard";

export function TopArticlesTable({
  articles,
}: {
  articles: TopArticleEntry[];
}) {
  if (articles.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No published articles yet"
        description="Once articles are published and read, the top performers show up here."
      />
    );
  }

  const columns: DataTableColumn<TopArticleEntry>[] = [
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
    { key: "authorName", header: "Author" },
    { key: "views", header: "Views", className: "text-right" },
  ];

  return (
    <DataTable
      columns={columns}
      data={articles}
      getRowId={(article) => article.id}
    />
  );
}
