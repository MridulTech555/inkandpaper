import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAnalyticsOverview() {
  const [articles, published, authors, totalViews, likes, comments] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({ where: { role: { name: "AUTHOR" } } }),
      prisma.articleView.count(),
      prisma.like.count(),
      prisma.comment.count({ where: { status: "VISIBLE" } }),
    ]);

  return { articles, published, authors, totalViews, likes, comments };
}

export interface DailyViews {
  date: string;
  views: number;
}

export async function getViewsTimeSeries(days = 30): Promise<DailyViews[]> {
  const since = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);

  const views = await prisma.articleView.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    buckets.set(date.toISOString().slice(0, 10), 0);
  }
  for (const view of views) {
    const key = view.createdAt.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()].map(([date, views]) => ({ date, views }));
}

export async function getArticlesAnalytics(take = 10) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { views: { _count: "desc" } },
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      author: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { views: true, likes: true, comments: true } },
    },
  });
}

export async function getAuthorsAnalytics(take = 10) {
  const authors = await prisma.user.findMany({
    where: { role: { name: "AUTHOR" } },
    select: {
      id: true,
      name: true,
      _count: { select: { articles: true } },
      articles: {
        where: { status: "PUBLISHED" },
        select: { _count: { select: { views: true } } },
      },
    },
  });

  return authors
    .map((author) => ({
      id: author.id,
      name: author.name,
      articleCount: author._count.articles,
      totalViews: author.articles.reduce(
        (sum, article) => sum + article._count.views,
        0,
      ),
    }))
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, take);
}

export async function getEngagementAnalytics() {
  const [likes, comments, bookmarks, topLiked] = await Promise.all([
    prisma.like.count(),
    prisma.comment.count({ where: { status: "VISIBLE" } }),
    prisma.bookmark.count(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { likes: { _count: "desc" } },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        _count: { select: { likes: true, comments: true, bookmarks: true } },
      },
    }),
  ]);

  return { likes, comments, bookmarks, topLiked };
}
