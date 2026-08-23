import { FileText, PenSquare, Users, Clock } from "lucide-react";
import { requireUser } from "@/lib/permissions/check";
import {
  getAdminDashboardCounts,
  getContentActivity,
  getNeedsAttention,
  getPendingAuthorRequests,
  getTopArticles,
  getTrafficOverview,
} from "@/lib/services/admin-dashboard";
import { H1, H2 } from "@/components/ui/typography";
import { StatCard } from "@/components/ui/stat-card";
import { NeedsAttentionList } from "@/components/admin/needs-attention-list";
import { ContentActivityChart } from "@/components/admin/content-activity-chart";
import { TopArticlesTable } from "@/components/admin/top-articles-table";
import { AuthorRequestsPanel } from "@/components/admin/author-requests-panel";

export default async function AdminDashboardPage() {
  const user = await requireUser();

  const [
    counts,
    activity,
    traffic,
    topArticles,
    needsAttention,
    authorRequests,
  ] = await Promise.all([
    getAdminDashboardCounts(),
    getContentActivity(),
    getTrafficOverview(),
    getTopArticles(),
    getNeedsAttention(),
    getPendingAuthorRequests(),
  ]);

  const trafficDelta =
    traffic.viewsPrevious7Days > 0
      ? Math.round(
          ((traffic.viewsLast7Days - traffic.viewsPrevious7Days) /
            traffic.viewsPrevious7Days) *
            100,
        )
      : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <H1 className="text-2xl">Welcome back, {user.name.split(" ")[0]}</H1>
        <p className="text-foreground-secondary text-sm">
          Here&apos;s what&apos;s happening across Ink &amp; Paper.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Articles" value={counts.articles} icon={FileText} />
        <StatCard label="Authors" value={counts.authors} icon={PenSquare} />
        <StatCard label="Readers" value={counts.readers} icon={Users} />
        <StatCard
          label="Pending reviews"
          value={counts.pendingReviews}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="border-border bg-surface-elevated flex flex-col gap-4 rounded-lg border p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <H2 className="text-lg">Content activity</H2>
            <span className="text-foreground-muted text-xs">Last 14 days</span>
          </div>
          <ContentActivityChart days={activity} />
        </section>

        <section className="border-border bg-surface-elevated flex flex-col gap-4 rounded-lg border p-5">
          <H2 className="text-lg">Traffic overview</H2>
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-foreground text-2xl font-semibold">
                {traffic.totalViews}
              </span>
              <p className="text-foreground-muted text-sm">Total views</p>
            </div>
            <div>
              <span className="text-foreground text-2xl font-semibold">
                {traffic.uniqueReaders}
              </span>
              <p className="text-foreground-muted text-sm">Unique readers</p>
            </div>
            <div>
              <span className="text-foreground text-2xl font-semibold">
                {traffic.viewsLast7Days}
              </span>
              <p className="text-foreground-muted text-sm">
                Views this week
                {trafficDelta !== null ? (
                  <span
                    className={
                      trafficDelta >= 0 ? "text-success" : "text-error"
                    }
                  >
                    {" "}
                    ({trafficDelta >= 0 ? "+" : ""}
                    {trafficDelta}%)
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-3">
        <H2 className="text-lg">Top articles</H2>
        <TopArticlesTable articles={topArticles} />
      </section>

      <section className="flex flex-col gap-3">
        <H2 className="text-lg">Needs attention</H2>
        <NeedsAttentionList items={needsAttention} />
      </section>

      {authorRequests.length > 0 ? (
        <section className="flex flex-col gap-3">
          <H2 className="text-lg">Author requests</H2>
          <AuthorRequestsPanel requests={authorRequests} />
        </section>
      ) : null}
    </div>
  );
}
