import { Eye, Users, Clock, Heart } from "lucide-react";
import { requireUser } from "@/lib/permissions/check";
import { getAuthorAnalytics } from "@/lib/services/author-analytics";
import { H1, H2 } from "@/components/ui/typography";
import { StatCard } from "@/components/ui/stat-card";
import { TopArticlesChart } from "@/components/author/top-articles-chart";

export default async function AuthorAnalyticsPage() {
  const user = await requireUser();
  const analytics = await getAuthorAnalytics(user.id);

  return (
    <div className="flex flex-col gap-8">
      <H1 className="text-2xl">Analytics</H1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Views" value={analytics.totalViews} icon={Eye} />
        <StatCard
          label="Unique readers"
          value={analytics.uniqueReaders}
          icon={Users}
        />
        <StatCard
          label="Avg. reading time"
          value={`${analytics.avgReadingTime} min`}
          icon={Clock}
        />
        <StatCard
          label="Engagement"
          value={analytics.engagement}
          icon={Heart}
        />
      </div>

      <section className="flex flex-col gap-4">
        <H2 className="text-lg">Top articles by views</H2>
        <TopArticlesChart articles={analytics.topArticles} />
      </section>
    </div>
  );
}
