import "server-only";
import { prisma } from "@/lib/db/prisma";

export const reviewQueueSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  updatedAt: true,
  createdAt: true,
  category: { select: { name: true } },
  author: { select: { id: true, name: true } },
  _count: { select: { blocks: true } },
} as const;

export type ReviewQueueItem = Awaited<
  ReturnType<typeof getReviewQueueArticles>
>[number];

export async function getReviewQueueArticles() {
  return prisma.article.findMany({
    where: { status: "IN_REVIEW" },
    orderBy: { updatedAt: "asc" },
    select: reviewQueueSelect,
  });
}

export async function getArticleReviewHistory(articleId: string) {
  return prisma.articleReview.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      comment: true,
      createdAt: true,
      reviewer: { select: { name: true } },
    },
  });
}
