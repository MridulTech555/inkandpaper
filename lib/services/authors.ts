import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAuthorProfileBySlug(slug: string) {
  return prisma.authorProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      bio: true,
      avatarUrl: true,
      socialLinks: true,
      user: {
        select: {
          id: true,
          name: true,
          _count: {
            select: { articles: { where: { status: "PUBLISHED" } } },
          },
        },
      },
    },
  });
}

export async function getPublishedAuthors() {
  return prisma.authorProfile.findMany({
    where: { user: { articles: { some: { status: "PUBLISHED" } } } },
    orderBy: { user: { name: "asc" } },
    select: {
      slug: true,
      user: { select: { id: true, name: true } },
    },
  });
}
