import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/services/articles";
import { siteConfig } from "@/config/site";
import { ArticleCard } from "@/components/blog/article-card";
import { ArticleSection } from "@/components/blog/article-section";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { EmptyState } from "@/components/ui/empty-state";
import { Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function HomePage() {
  const articles = await getPublishedArticles(20);

  if (articles.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 items-center justify-center px-4 py-24">
        <EmptyState
          icon={Newspaper}
          title="No articles yet"
          description="Published articles will appear here once they go live."
        />
      </div>
    );
  }

  const [hero, ...rest] = articles;
  const trending = rest.slice(0, 4);
  const latest = rest.slice(0, 6);
  const recommended = [...rest].reverse().slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 py-10 sm:px-6">
      <ArticleCard article={hero} variant="featured" />

      {trending.length > 0 ? (
        <ArticleSection title="Trending">
          {trending.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant="vertical"
            />
          ))}
        </ArticleSection>
      ) : null}

      {latest.length > 0 ? (
        <ArticleSection title="Latest articles">
          {latest.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant="vertical"
            />
          ))}
        </ArticleSection>
      ) : null}

      {recommended.length > 0 ? (
        <ArticleSection
          title="Recommended for you"
          gridClassName="grid-cols-1 sm:grid-cols-2"
        >
          {recommended.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant="horizontal"
            />
          ))}
        </ArticleSection>
      ) : null}

      <NewsletterCta />
    </div>
  );
}
