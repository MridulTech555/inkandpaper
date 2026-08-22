import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { articleCardSelect } from "@/lib/services/articles";

export interface SearchArticlesParams {
  query?: string;
  categorySlug?: string;
  authorSlug?: string;
  skip: number;
  take: number;
}

export async function searchArticles({
  query,
  categorySlug,
  authorSlug,
  skip,
  take,
}: SearchArticlesParams) {
  const where: Prisma.ArticleWhereInput = {
    status: "PUBLISHED",
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(authorSlug ? { author: { authorProfile: { slug: authorSlug } } } : {}),
  };

  return prisma.$transaction([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      select: articleCardSelect,
    }),
    prisma.article.count({ where }),
  ]);
}
