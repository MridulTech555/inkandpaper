import "server-only";
import type { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface AdminArticleFilters {
  search?: string;
  status?: ArticleStatus;
  authorId?: string;
  categoryId?: string;
}

export const adminArticleListSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  publishedAt: true,
  updatedAt: true,
  category: { select: { name: true, slug: true } },
  author: { select: { id: true, name: true } },
  _count: { select: { views: true } },
} as const;

export type AdminArticleListItem = NonNullable<
  Awaited<ReturnType<typeof getAdminArticles>>
>[0][number];

export async function getAdminArticles(
  filters: AdminArticleFilters,
  skip: number,
  take: number,
) {
  const where: Prisma.ArticleWhereInput = {
    ...(filters.search
      ? { title: { contains: filters.search, mode: "insensitive" } }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.authorId ? { authorId: filters.authorId } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
  };

  return prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      select: adminArticleListSelect,
    }),
    prisma.article.count({ where }),
  ]);
}

export async function getArticleFilterOptions() {
  const [authors, categories] = await Promise.all([
    prisma.user.findMany({
      where: { articles: { some: {} } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  return { authors, categories };
}
