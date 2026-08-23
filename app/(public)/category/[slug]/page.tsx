import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByCategory } from "@/lib/services/articles";
import { getCategoryBySlug } from "@/lib/services/categories";
import { siteConfig } from "@/config/site";
import { H1, Body } from "@/components/ui/typography";
import { ArticleCard } from "@/components/blog/article-card";
import { ArticleSection } from "@/components/blog/article-section";
import { ResultsPagination } from "@/components/blog/results-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderOpen } from "lucide-react";

const PAGE_SIZE = 10;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description ?? `Articles in ${category.name}`,
    alternates: { canonical: `${siteConfig.url}/category/${category.slug}` },
    openGraph: {
      title: category.name,
      description: category.description ?? undefined,
      url: `${siteConfig.url}/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [articles, total] = await getArticlesByCategory(
    category.id,
    skip,
    PAGE_SIZE,
  );
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const featured = page === 1 ? articles[0] : undefined;
  const latest = page === 1 ? articles.slice(1) : articles;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <H1>{category.name}</H1>
        {category.description ? (
          <Body className="text-foreground-secondary">
            {category.description}
          </Body>
        ) : null}
      </header>

      {articles.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No articles in this category yet"
          description="Check back soon — new articles are added regularly."
        />
      ) : (
        <>
          {featured ? (
            <ArticleCard article={featured} variant="featured" />
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

          <ResultsPagination page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  );
}
