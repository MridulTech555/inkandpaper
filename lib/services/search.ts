import "server-only";
import { PostgresSearchProvider } from "@/lib/services/postgres-search-provider";
import type { SearchProvider } from "@/lib/services/search-provider";

// The active provider. Swapping to an external search engine later means
// implementing SearchProvider once and changing this one line — nothing
// that calls searchArticles() needs to know or care.
const searchProvider: SearchProvider = new PostgresSearchProvider();

export interface SearchArticlesParams {
  query?: string;
  categorySlug?: string;
  authorSlug?: string;
  dateFrom?: Date;
  dateTo?: Date;
  skip: number;
  take: number;
}

export async function searchArticles({
  query,
  categorySlug,
  authorSlug,
  dateFrom,
  dateTo,
  skip,
  take,
}: SearchArticlesParams) {
  return searchProvider.search(
    { query, categorySlug, authorSlug, dateFrom, dateTo },
    { skip, take },
  );
}
