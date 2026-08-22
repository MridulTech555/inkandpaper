import "server-only";
import { prisma } from "@/lib/db/prisma";
import { computeReadingTime } from "@/lib/services/articles";

export interface AuthorAnalytics {
  totalViews: number;
  uniqueReaders: number;
  avgReadingTime: number;
  engagement: number;
  topArticles: { id: string; title: string; slug: string; views: number }[];
}

export async function getAuthorAnalytics(
  authorId: string,
): Promise<AuthorAnalytics> {
  const [
    totalViews,
    distinctLoggedInReaders,
    anonymousViews,
    likesCount,
    commentsCount,
    publishedArticles,
    topArticlesRaw,
  ] = await Promise.all([
    prisma.articleView.count({ where: { article: { authorId } } }),
    prisma.articleView.findMany({
      where: { article: { authorId }, userId: { not: null } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.articleView.count({
      where: { article: { authorId }, userId: null },
    }),
    prisma.like.count({ where: { article: { authorId } } }),
    prisma.comment.count({
      where: { article: { authorId }, status: "VISIBLE" },
    }),
    prisma.article.findMany({
      where: { authorId, status: "PUBLISHED" },
      select: { blocks: { select: { content: true } } },
    }),
    prisma.article.findMany({
      where: { authorId },
      orderBy: { views: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        _count: { select: { views: true } },
      },
    }),
  ]);

  const avgReadingTime =
    publishedArticles.length > 0
      ? Math.round(
          publishedArticles.reduce(
            (sum, article) => sum + computeReadingTime(article.blocks),
            0,
          ) / publishedArticles.length,
        )
      : 0;

  return {
    totalViews,
    uniqueReaders: distinctLoggedInReaders.length + anonymousViews,
    avgReadingTime,
    engagement: likesCount + commentsCount,
    topArticles: topArticlesRaw.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      views: article._count.views,
    })),
  };
}
