import type { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import { searchArticles } from "@/lib/services/search";
import { getAllCategories } from "@/lib/services/categories";
import { getPublishedAuthors } from "@/lib/services/authors";
import { H1 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/blog/article-card";
import { ResultsPagination } from "@/components/blog/results-pagination";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Search",
  description: "Search articles by keyword, category, or author.",
};

const PAGE_SIZE = 9;

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    author?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, author, page: pageParam } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const hasCriteria = Boolean(query || category || author);

  const [searchResult, categories, authors] = await Promise.all([
    hasCriteria
      ? searchArticles({
          query: query || undefined,
          categorySlug: category || undefined,
          authorSlug: author || undefined,
          skip,
          take: PAGE_SIZE,
        })
      : null,
    getAllCategories(),
    getPublishedAuthors(),
  ]);
  const [articles, total] = searchResult ?? [[], 0];

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <H1>Search</H1>

      <form
        method="GET"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="text-foreground text-sm font-medium">
            Keyword
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="Search articles…"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="category"
            className="text-foreground text-sm font-medium"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? ""}
            className="border-border text-foreground focus-visible:ring-primary h-10 rounded-md border bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="author"
            className="text-foreground text-sm font-medium"
          >
            Author
          </label>
          <select
            id="author"
            name="author"
            defaultValue={author ?? ""}
            className="border-border text-foreground focus-visible:ring-primary h-10 rounded-md border bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="">All authors</option>
            {authors.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.user.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit">Search</Button>
      </form>

      {!hasCriteria ? (
        <EmptyState
          icon={SearchIcon}
          title="Search for something"
          description="Enter a keyword, or filter by category or author, to find articles."
        />
      ) : articles.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No results found"
          description={
            query
              ? `Nothing matched "${query}". Try a different search.`
              : "Nothing matched those filters."
          }
        />
      ) : (
        <>
          <p className="text-foreground-muted text-sm">
            {total} {total === 1 ? "result" : "results"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="vertical"
              />
            ))}
          </div>
          <ResultsPagination page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  );
}
