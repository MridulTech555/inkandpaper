import { requirePermission } from "@/lib/permissions/check";
import { getTrafficOverview } from "@/lib/services/admin-dashboard";
import { getViewsTimeSeries } from "@/lib/services/admin-analytics";
import { H1, H2 } from "@/components/ui/typography";
import { StatCard } from "@/components/ui/stat-card";
import { AnalyticsTabs } from "@/components/admin/analytics-tabs";
import { SimpleLineChart } from "@/components/admin/simple-line-chart";
import { Eye, Users, TrendingUp } from "lucide-react";

export default async function AdminTrafficAnalyticsPage() {
  await requirePermission("analytics:view");
  const [traffic, series] = await Promise.all([
    getTrafficOverview(),
    getViewsTimeSeries(30),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Analytics</H1>
      <AnalyticsTabs current="/admin/analytics/traffic" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total views" value={traffic.totalViews} icon={Eye} />
        <StatCard
          label="Unique readers"
          value={traffic.uniqueReaders}
          icon={Users}
        />
        <StatCard
          label="Views this week"
          value={traffic.viewsLast7Days}
          icon={TrendingUp}
        />
      </div>

      <section className="border-border bg-surface-elevated flex flex-col gap-4 rounded-lg border p-5">
        <H2 className="text-lg">Views, last 30 days</H2>
        <SimpleLineChart
          label="views"
          data={series.map((point) => ({
            date: point.date,
            value: point.views,
          }))}
        />
      </section>
    </div>
  );
}
