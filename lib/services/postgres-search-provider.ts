import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  articleCardSelect,
  type ArticleCardData,
} from "@/lib/services/articles";
import type {
  SearchFilters,
  SearchPage,
  SearchProvider,
} from "@/lib/services/search-provider";

/**
 * Searches title, excerpt, and block content (paragraphs, headings, quotes,
 * callouts — anything with a `text` field) using Postgres ILIKE / JSON path
 * filters. No external index required, which keeps this the default for a
 * fresh install.
 */
export class PostgresSearchProvider implements SearchProvider {
  async search(
    filters: SearchFilters,
    page: SearchPage,
  ): Promise<[ArticleCardData[], number]> {
    const where: Prisma.ArticleWhereInput = {
      status: "PUBLISHED",
      ...(filters.query
        ? {
            OR: [
              { title: { contains: filters.query, mode: "insensitive" } },
              { excerpt: { contains: filters.query, mode: "insensitive" } },
              {
                blocks: {
                  some: {
                    content: {
                      path: ["text"],
                      string_contains: filters.query,
                    },
                  },
                },
              },
            ],
          }
        : {}),
      ...(filters.categorySlug
        ? { category: { slug: filters.categorySlug } }
        : {}),
      ...(filters.authorSlug
        ? { author: { authorProfile: { slug: filters.authorSlug } } }
        : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            publishedAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    };

    return prisma.$transaction([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: page.skip,
        take: page.take,
        select: articleCardSelect,
      }),
      prisma.article.count({ where }),
    ]);
  }
}
