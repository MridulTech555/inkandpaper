import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye, Users as UsersIcon, Clock, Heart } from "lucide-react";
import {
  getAdminAuthorDetail,
  getAuthorActivity,
} from "@/lib/services/admin-authors";
import { getAuthorAnalytics } from "@/lib/services/author-analytics";
import { getAdminArticles } from "@/lib/services/admin-articles";
import { H1 } from "@/components/ui/typography";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminArticleTable } from "@/components/admin/admin-article-table";
import { TopArticlesChart } from "@/components/author/top-articles-chart";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const REVIEW_STATUS_VARIANT = {
  PENDING: "default",
  APPROVED: "success",
  CHANGES_REQUESTED: "warning",
  REJECTED: "error",
} as const;

interface AuthorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminAuthorDetailPage({
  params,
}: AuthorDetailPageProps) {
  const { id } = await params;
  const author = await getAdminAuthorDetail(id);
  if (!author) notFound();

  const [analytics, [articles], activity] = await Promise.all([
    getAuthorAnalytics(id),
    getAdminArticles({ authorId: id }, 0, 50),
    getAuthorActivity(id),
  ]);

  const socialLinks = (author.authorProfile?.socialLinks ?? {}) as Record<
    string,
    unknown
  >;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar
          size="lg"
          fallback={author.name.charAt(0)}
          src={author.authorProfile?.avatarUrl ?? undefined}
        />
        <div>
          <H1 className="text-2xl">{author.name}</H1>
          <p className="text-foreground-muted text-sm">{author.email}</p>
        </div>
        <Badge
          variant={author.status === "ACTIVE" ? "success" : "outline"}
          className="ml-auto"
        >
          {author.status}
        </Badge>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="border-border bg-surface-elevated flex flex-col gap-4 rounded-lg border p-5">
            <div>
              <span className="text-foreground-muted text-xs font-medium uppercase">
                Slug
              </span>
              <p className="text-foreground text-sm">
                {author.authorProfile?.slug ?? "—"}
              </p>
            </div>
            <div>
              <span className="text-foreground-muted text-xs font-medium uppercase">
                Bio
              </span>
              <p className="text-foreground-secondary text-sm">
                {author.authorProfile?.bio ?? "No bio yet."}
              </p>
            </div>
            <div>
              <span className="text-foreground-muted text-xs font-medium uppercase">
                Social links
              </span>
              {Object.keys(socialLinks).length === 0 ? (
                <p className="text-foreground-secondary text-sm">None</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {Object.entries(socialLinks).map(([key, value]) =>
                    typeof value === "string" && value ? (
                      <li key={key} className="text-sm">
                        <span className="text-foreground-muted capitalize">
                          {key}:{" "}
                        </span>
                        <a
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          {value}
                        </a>
                      </li>
                    ) : null,
                  )}
                </ul>
              )}
            </div>
            <div>
              <span className="text-foreground-muted text-xs font-medium uppercase">
                Joined
              </span>
              <p className="text-foreground-secondary text-sm">
                {formatDate(author.createdAt)}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="articles">
          <AdminArticleTable articles={articles} />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Views" value={analytics.totalViews} icon={Eye} />
              <StatCard
                label="Unique readers"
                value={analytics.uniqueReaders}
                icon={UsersIcon}
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
            <TopArticlesChart articles={analytics.topArticles} />
          </div>
        </TabsContent>

        <TabsContent value="activity">
          {activity.reviews.length === 0 ? (
            <EmptyState
              title="No review activity yet"
              description="Editorial feedback on this author's articles will show up here."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {activity.reviews.map((review) => (
                <li
                  key={review.id}
                  className="border-border bg-surface-elevated flex flex-col gap-1 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground text-sm font-medium">
                      {review.article.title}
                    </span>
                    <Badge variant={REVIEW_STATUS_VARIANT[review.status]}>
                      {review.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-foreground-muted text-xs">
                    {review.reviewer?.name ?? "System"} ·{" "}
                    {formatDate(review.createdAt)}
                  </p>
                  {review.comment ? (
                    <p className="text-foreground-secondary text-sm">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="permissions">
          <div className="border-border bg-surface-elevated flex flex-col gap-3 rounded-lg border p-5">
            <div>
              <span className="text-foreground-muted text-xs font-medium uppercase">
                Role
              </span>
              <p className="text-foreground text-sm font-medium">
                {author.role.name}
              </p>
            </div>
            <div>
              <span className="text-foreground-muted text-xs font-medium uppercase">
                Permissions
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {author.role.permissions.map(({ permission }) => (
                  <Badge key={permission.name} variant="outline">
                    {permission.name}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-foreground-muted text-xs">
              To change this author&apos;s role, use{" "}
              <Link
                href="/admin/users"
                className="text-primary hover:underline"
              >
                Users
              </Link>
              .
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
