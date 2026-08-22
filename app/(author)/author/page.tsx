import Link from "next/link";
import { FileText, CheckCircle2, Eye } from "lucide-react";
import { requireUser } from "@/lib/permissions/check";
import {
  getArticlesNeedingAttention,
  getAuthorArticleStats,
  getRecentArticles,
} from "@/lib/services/author-articles";
import { H1 } from "@/components/ui/typography";
import { StatCard } from "@/components/ui/stat-card";
import { ArticleTable } from "@/components/author/article-table";
import { WriteArticleButton } from "@/components/author/write-article-button";

export default async function AuthorDashboardPage() {
  const user = await requireUser();

  const [stats, recentArticles, needsAttention] = await Promise.all([
    getAuthorArticleStats(user.id),
    getRecentArticles(user.id),
    getArticlesNeedingAttention(user.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <H1 className="text-2xl">Welcome back, {user.name.split(" ")[0]}</H1>
          <p className="text-foreground-secondary text-sm">
            Here&apos;s what&apos;s happening with your writing.
          </p>
        </div>
        <WriteArticleButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Drafts" value={stats.drafts} icon={FileText} />
        <StatCard
          label="Published"
          value={stats.published}
          icon={CheckCircle2}
        />
        <StatCard label="Views" value={stats.totalViews} icon={Eye} />
      </div>

      {needsAttention.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-lg font-semibold">
            Needs attention
          </h2>
          <ArticleTable articles={needsAttention} />
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground text-lg font-semibold">
            Recent articles
          </h2>
          <Link
            href="/author/articles"
            className="text-primary text-sm hover:underline"
          >
            View all
          </Link>
        </div>
        <ArticleTable articles={recentArticles} />
      </section>
    </div>
  );
}
