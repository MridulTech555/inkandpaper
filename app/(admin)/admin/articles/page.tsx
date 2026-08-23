import type { ArticleStatus } from "@prisma/client";
import { H1 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getAdminArticles,
  getArticleFilterOptions,
} from "@/lib/services/admin-articles";
import { AdminArticleTable } from "@/components/admin/admin-article-table";
import { ResultsPagination } from "@/components/blog/results-pagination";

const PAGE_SIZE = 15;
const VALID_STATUSES: ArticleStatus[] = [
  "DRAFT",
  "IN_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
  "REJECTED",
];

interface AdminArticlesPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    author?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function AdminArticlesPage({
  searchParams,
}: AdminArticlesPageProps) {
  const {
    q,
    status: statusParam,
    author,
    category,
    page: pageParam,
  } = await searchParams;

  const status = VALID_STATUSES.find((value) => value === statusParam);
  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [[articles, total], { authors, categories }] = await Promise.all([
    getAdminArticles(
      {
        search: q || undefined,
        status,
        authorId: author,
        categoryId: category,
      },
      skip,
      PAGE_SIZE,
    ),
    getArticleFilterOptions(),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Articles</H1>

      <form
        method="GET"
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="text-foreground text-sm font-medium">
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search titles…"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="status"
            className="text-foreground text-sm font-medium"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="border-border text-foreground focus-visible:ring-primary h-10 rounded-md border bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="">All statuses</option>
            {VALID_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value.replace(/_/g, " ")}
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
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
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
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit">Filter</Button>
      </form>

      <p className="text-foreground-muted text-sm">
        {total} {total === 1 ? "article" : "articles"}
      </p>

      <AdminArticleTable articles={articles} />

      <ResultsPagination page={page} pageCount={pageCount} />
    </div>
  );
}
