import type { Metadata } from "next";
import {
  getMostDiscussedArticles,
  getPublishedArticles,
  getTrendingArticles,
} from "@/lib/services/articles";
import { getTopicsWithCounts } from "@/lib/services/categories";
import { getFeaturedAuthors } from "@/lib/services/authors";
import { siteConfig } from "@/config/site";
import { ArticleCard } from "@/components/blog/article-card";
import { ArticleSection } from "@/components/blog/article-section";
import { TopicStrip } from "@/components/blog/topic-strip";
import { AuthorRail } from "@/components/blog/author-rail";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { EmptyState } from "@/components/ui/empty-state";
import { Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

// The home page is a fixed, curated set of sections — deliberately not one
// section per feature. Rules that keep it from bloating as the catalogue
// grows:
//   1. Every article appears at most once (tracked in `used`), computed in
//      priority order: hero → trending → discussed → latest.
//   2. Each optional section renders only when it has enough genuine content
//      to justify the space (MIN_SECTION_ITEMS); otherwise it disappears.
//   3. Item counts per section are capped, so the page stays about the same
//      length whether there are 10 articles or 10,000 — it just fills in.
//   4. Layouts alternate (full-bleed hero, pill strip, card grids, author
//      cards) so the page has rhythm instead of six identical grids.
const MIN_SECTION_ITEMS = 3;

export default async function HomePage() {
  const pool = await getPublishedArticles(30);

  if (pool.length === 0) {
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

  const [hero, ...poolRest] = pool;
  const used = new Set<string>([hero.id]);

  const [topics, trending, discussed, authors] = await Promise.all([
    getTopicsWithCounts(),
    getTrendingArticles({ days: 7, take: 3, excludeIds: [hero.id] }),
    getMostDiscussedArticles({ days: 30, take: 5, excludeIds: [hero.id] }),
    getFeaturedAuthors(6),
  ]);

  trending.forEach((article) => used.add(article.id));

  const discussedUnique = discussed.filter((article) => !used.has(article.id));
  discussedUnique.forEach((article) => used.add(article.id));

  const latest = poolRest
    .filter((article) => !used.has(article.id))
    .slice(0, 6);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 py-10 sm:px-6">
      <ArticleCard article={hero} variant="featured" />

      {topics.length > 0 ? <TopicStrip topics={topics} /> : null}

      {trending.length >= MIN_SECTION_ITEMS ? (
        <ArticleSection title="Trending this week">
          {trending.map((article) => (
            <ArticleCard key={article.id} article={article} variant="vertical" />
          ))}
        </ArticleSection>
      ) : null}

      {latest.length > 0 ? (
        <ArticleSection title="Latest articles">
          {latest.map((article) => (
            <ArticleCard key={article.id} article={article} variant="vertical" />
          ))}
        </ArticleSection>
      ) : null}

      {discussedUnique.length >= MIN_SECTION_ITEMS ? (
        <ArticleSection
          title="Most discussed"
          gridClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
        >
          {discussedUnique.map((article) => (
            <ArticleCard key={article.id} article={article} variant="compact" />
          ))}
        </ArticleSection>
      ) : null}

      {authors.length >= 2 ? <AuthorRail authors={authors} /> : null}

      <NewsletterCta />
    </div>
  );
}
