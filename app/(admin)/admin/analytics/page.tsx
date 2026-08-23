import { requirePermission } from "@/lib/permissions/check";
import { getAnalyticsOverview } from "@/lib/services/admin-analytics";
import { getTopArticles } from "@/lib/services/admin-dashboard";
import { H1 } from "@/components/ui/typography";
import { StatCard } from "@/components/ui/stat-card";
import { AnalyticsTabs } from "@/components/admin/analytics-tabs";
import { TopArticlesTable } from "@/components/admin/top-articles-table";
import {
  FileText,
  CheckCircle2,
  PenSquare,
  Eye,
  Heart,
  MessageSquare,
} from "lucide-react";

export default async function AdminAnalyticsOverviewPage() {
  await requirePermission("analytics:view");
  const [overview, topArticles] = await Promise.all([
    getAnalyticsOverview(),
    getTopArticles(5),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Analytics</H1>
      <AnalyticsTabs current="/admin/analytics" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Articles" value={overview.articles} icon={FileText} />
        <StatCard
          label="Published"
          value={overview.published}
          icon={CheckCircle2}
        />
        <StatCard label="Authors" value={overview.authors} icon={PenSquare} />
        <StatCard label="Views" value={overview.totalViews} icon={Eye} />
        <StatCard label="Likes" value={overview.likes} icon={Heart} />
        <StatCard
          label="Comments"
          value={overview.comments}
          icon={MessageSquare}
        />
      </div>

      <TopArticlesTable articles={topArticles} />
    </div>
  );
}
