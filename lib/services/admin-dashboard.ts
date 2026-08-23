import "server-only";
import { prisma } from "@/lib/db/prisma";

export interface AdminDashboardCounts {
  articles: number;
  authors: number;
  readers: number;
  pendingReviews: number;
}

export async function getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
  const [articles, authors, readers, pendingReviews] = await Promise.all([
    prisma.article.count(),
    prisma.user.count({ where: { role: { name: "AUTHOR" } } }),
    prisma.user.count({ where: { role: { name: "READER" } } }),
    prisma.article.count({ where: { status: "IN_REVIEW" } }),
  ]);
  return { articles, authors, readers, pendingReviews };
}

export interface ContentActivityDay {
  date: string;
  published: number;
  submitted: number;
}

/** Articles published vs. submitted for review, per day, over the last 14 days. */
export async function getContentActivity(): Promise<ContentActivityDay[]> {
  const days = 14;
  const since = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);

  const [published, revisions] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: since } },
      select: { publishedAt: true },
    }),
    prisma.article.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const buckets = new Map<string, ContentActivityDay>();
  for (let i = 0; i < days; i++) {
    const date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, { date: key, published: 0, submitted: 0 });
  }

  for (const article of published) {
    const key = article.publishedAt?.toISOString().slice(0, 10);
    const bucket = key ? buckets.get(key) : undefined;
    if (bucket) bucket.published += 1;
  }
  for (const article of revisions) {
    const key = article.createdAt.toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) bucket.submitted += 1;
  }

  return [...buckets.values()];
}

export interface TrafficOverview {
  totalViews: number;
  uniqueReaders: number;
  viewsLast7Days: number;
  viewsPrevious7Days: number;
}

export async function getTrafficOverview(): Promise<TrafficOverview> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    totalViews,
    distinctLoggedInReaders,
    anonymousViews,
    viewsLast7Days,
    viewsPrevious7Days,
  ] = await Promise.all([
    prisma.articleView.count(),
    prisma.articleView.findMany({
      where: { userId: { not: null } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.articleView.count({ where: { userId: null } }),
    prisma.articleView.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.articleView.count({
      where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    }),
  ]);

  return {
    totalViews,
    uniqueReaders: distinctLoggedInReaders.length + anonymousViews,
    viewsLast7Days,
    viewsPrevious7Days,
  };
}

export type TopArticleEntry = {
  id: string;
  title: string;
  slug: string;
  views: number;
  authorName: string;
} & Record<string, unknown>;

export async function getTopArticles(take = 5): Promise<TopArticleEntry[]> {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { views: { _count: "desc" } },
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      author: { select: { name: true } },
      _count: { select: { views: true } },
    },
  });

  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    views: article._count.views,
    authorName: article.author.name,
  }));
}

export interface NeedsAttentionItem {
  id: string;
  label: string;
  count: number;
  href: string;
}

export async function getNeedsAttention(): Promise<NeedsAttentionItem[]> {
  const [
    pendingReviews,
    reportedComments,
    authorRequests,
    failedPublishing,
    suspendedUsers,
    emptyCategories,
  ] = await Promise.all([
    prisma.article.count({ where: { status: "IN_REVIEW" } }),
    prisma.comment.count({ where: { status: "REPORTED" } }),
    prisma.authorRequest.count({ where: { status: "PENDING" } }),
    prisma.article.count({
      where: { status: "SCHEDULED", scheduledAt: { lt: new Date() } },
    }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.category.count({ where: { articles: { none: {} } } }),
  ]);

  const items: NeedsAttentionItem[] = [
    {
      id: "pending-reviews",
      label: "Pending reviews",
      count: pendingReviews,
      href: "/admin/review",
    },
    {
      id: "reported-comments",
      label: "Reported comments",
      count: reportedComments,
      href: "/admin/comments?status=REPORTED",
    },
    {
      id: "author-requests",
      label: "Author requests",
      count: authorRequests,
      href: "/admin#author-requests",
    },
    {
      id: "failed-publishing",
      label: "Failed publishing",
      count: failedPublishing,
      href: "/admin/articles?status=SCHEDULED",
    },
  ];

  const systemAlertCount =
    (suspendedUsers > 0 ? 1 : 0) + (emptyCategories > 0 ? 1 : 0);
  const systemAlertMessages = [
    ...(suspendedUsers > 0
      ? [`${suspendedUsers} user${suspendedUsers === 1 ? "" : "s"} suspended`]
      : []),
    ...(emptyCategories > 0
      ? [
          `${emptyCategories} categor${emptyCategories === 1 ? "y has" : "ies have"} no articles`,
        ]
      : []),
  ];

  items.push({
    id: "system-alerts",
    label:
      systemAlertMessages.length > 0
        ? systemAlertMessages.join(" · ")
        : "System alerts",
    count: systemAlertCount,
    href: "/admin/users?status=SUSPENDED",
  });

  return items;
}

export async function getPendingAuthorRequests() {
  return prisma.authorRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      message: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
