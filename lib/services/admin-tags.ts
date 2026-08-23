import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getAdminTags(search?: string) {
  const where: Prisma.TagWhereInput = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};

  return prisma.tag.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { articles: true } },
    },
  });
}

export type AdminTagListItem = Awaited<ReturnType<typeof getAdminTags>>[number];
