import "server-only";
import type { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const authorArticleListSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  publishedAt: true,
  updatedAt: true,
  category: { select: { name: true, slug: true } },
  _count: { select: { views: true } },
} as const;

export type AuthorArticleListItem = NonNullable<
  Awaited<ReturnType<typeof getAuthorArticles>>
>[0][number];

export async function getAuthorArticles(
  authorId: string,
  status: ArticleStatus | undefined,
  skip: number,
  take: number,
) {
  const where: Prisma.ArticleWhereInput = {
    authorId,
    ...(status ? { status } : {}),
  };

  return prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      select: authorArticleListSelect,
    }),
    prisma.article.count({ where }),
  ]);
}

export async function getAuthorArticleStats(authorId: string) {
  const [drafts, published, viewAggregate] = await Promise.all([
    prisma.article.count({ where: { authorId, status: "DRAFT" } }),
    prisma.article.count({ where: { authorId, status: "PUBLISHED" } }),
    prisma.articleView.count({ where: { article: { authorId } } }),
  ]);

  return { drafts, published, totalViews: viewAggregate };
}

export async function getRecentArticles(authorId: string, take = 5) {
  return prisma.article.findMany({
    where: { authorId },
    orderBy: { updatedAt: "desc" },
    take,
    select: authorArticleListSelect,
  });
}

export async function getArticlesNeedingAttention(authorId: string) {
  return prisma.article.findMany({
    where: { authorId, status: { in: ["CHANGES_REQUESTED", "REJECTED"] } },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: authorArticleListSelect,
  });
}

export async function getOwnedArticleForEdit(
  articleId: string,
  authorId: string,
) {
  return prisma.article.findFirst({
    where: { id: articleId, authorId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      status: true,
      scheduledAt: true,
      categoryId: true,
      seo: true,
      blocks: {
        orderBy: { position: "asc" },
        select: { type: true, content: true },
      },
      tags: { select: { tagId: true } },
    },
  });
}

export async function getOwnedArticleForPreview(
  articleId: string,
  authorId: string,
) {
  return prisma.article.findFirst({
    where: { id: articleId, authorId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      status: true,
      publishedAt: true,
      category: { select: { name: true, slug: true } },
      author: {
        select: {
          name: true,
          authorProfile: { select: { slug: true, avatarUrl: true, bio: true } },
        },
      },
      blocks: {
        orderBy: { position: "asc" },
        select: { id: true, type: true, position: true, content: true },
      },
      tags: { select: { tag: { select: { id: true, name: true } } } },
    },
  });
}
