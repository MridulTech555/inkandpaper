import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getAdminCategories(search?: string) {
  const where: Prisma.CategoryWhereInput = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};

  return prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      _count: { select: { articles: true } },
    },
  });
}

export type AdminCategoryListItem = Awaited<
  ReturnType<typeof getAdminCategories>
>[number];
