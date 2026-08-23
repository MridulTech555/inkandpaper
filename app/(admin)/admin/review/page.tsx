import { ClipboardCheck } from "lucide-react";
import { requirePermission } from "@/lib/permissions/check";
import { getReviewQueueArticles } from "@/lib/services/review-queue";
import { H1 } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { ReviewQueueCard } from "@/components/admin/review-queue-card";

export default async function AdminReviewQueuePage() {
  await requirePermission("article:review");
  const articles = await getReviewQueueArticles();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <H1 className="text-2xl">Review queue</H1>
        <p className="text-foreground-secondary text-sm">
          Articles authors have submitted, waiting on your decision.
        </p>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Nothing to review"
          description="Articles submitted for review will show up here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <ReviewQueueCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
