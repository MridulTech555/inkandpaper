import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";

export interface TopArticleEntry {
  id: string;
  title: string;
  slug: string;
  views: number;
}

export function TopArticlesChart({
  articles,
}: {
  articles: TopArticleEntry[];
}) {
  if (articles.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No views yet"
        description="Once readers visit your published articles, they'll show up here."
      />
    );
  }

  const maxViews = Math.max(...articles.map((article) => article.views), 1);

  return (
    <ul className="flex flex-col gap-3">
      {articles.map((article) => (
        <li key={article.id} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-4 text-sm">
            <Link
              href={`/article/${article.slug}`}
              className="text-foreground hover:text-primary truncate font-medium"
            >
              {article.title}
            </Link>
            <span className="text-foreground-muted shrink-0">
              {article.views} views
            </span>
          </div>
          <div className="bg-surface h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{
                width: `${Math.max(4, (article.views / maxViews) * 100)}%`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
