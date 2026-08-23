import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { requireUser } from "@/lib/permissions/check";
import { getBookmarkedArticles } from "@/lib/services/bookmarks";
import { H1 } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { ArticleCard } from "@/components/blog/article-card";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Articles you've saved to read later.",
};

export default async function BookmarksPage() {
  const user = await requireUser();
  const articles = await getBookmarkedArticles(user.id);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <H1>Bookmarks</H1>

      {articles.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks yet"
          description="Save articles to read later by bookmarking them from the article page."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant="vertical"
            />
          ))}
        </div>
      )}
    </div>
  );
}
