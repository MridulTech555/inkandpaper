import Link from "next/link";
import type { ArticleStatus } from "@prisma/client";
import { PenSquare } from "lucide-react";
import { requireUser } from "@/lib/permissions/check";
import { getAuthorArticles } from "@/lib/services/author-articles";
import { H1 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ArticleTabs } from "@/components/author/article-tabs";
import { ArticleTable } from "@/components/author/article-table";
import { ResultsPagination } from "@/components/blog/results-pagination";

const PAGE_SIZE = 10;
const VALID_STATUSES: ArticleStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "IN_REVIEW",
  "SCHEDULED",
];

interface AuthorArticlesPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AuthorArticlesPage({
  searchParams,
}: AuthorArticlesPageProps) {
  const user = await requireUser();
  const { status: statusParam, page: pageParam } = await searchParams;

  const status = VALID_STATUSES.find((value) => value === statusParam);
  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [articles, total] = await getAuthorArticles(
    user.id,
    status,
    skip,
    PAGE_SIZE,
  );
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <H1 className="text-2xl">Articles</H1>
        <Button asChild>
          <Link href="/author/articles/new">
            <PenSquare className="h-4 w-4" />
            Write article
          </Link>
        </Button>
      </div>

      <ArticleTabs currentStatus={status ?? ""} />

      <ArticleTable articles={articles} />

      <ResultsPagination page={page} pageCount={pageCount} />
    </div>
  );
}
