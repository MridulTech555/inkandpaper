import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
    },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

/**
 * Categories that have at least one published article, with the count.
 * Used by the home-page topic strip — empty categories are omitted so the
 * strip never advertises a dead end.
 */
export async function getTopicsWithCounts() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { articles: { where: { status: "PUBLISHED" } } },
      },
    },
  });

  return categories
    .map(({ _count, ...category }) => ({
      ...category,
      count: _count.articles,
    }))
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count);
}
