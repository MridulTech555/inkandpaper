import "server-only";
import type { ArticleCardData } from "@/lib/services/articles";

export interface SearchFilters {
  query?: string;
  categorySlug?: string;
  authorSlug?: string;
  /** Inclusive lower bound on publishedAt. */
  dateFrom?: Date;
  /** Inclusive upper bound on publishedAt. */
  dateTo?: Date;
}

export interface SearchPage {
  skip: number;
  take: number;
}

/**
 * Abstracts "search published articles" behind an interface so the Postgres
 * ILIKE implementation below can later be swapped for an external engine
 * (Algolia, Meilisearch, Elasticsearch, ...) without touching callers —
 * they only ever depend on this interface, never on Prisma directly.
 */
export interface SearchProvider {
  search(
    filters: SearchFilters,
    page: SearchPage,
  ): Promise<[ArticleCardData[], number]>;
}
