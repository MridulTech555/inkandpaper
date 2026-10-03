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

/**
 * Authors with published work, most prolific first, for the home-page rail.
 * The caller hides the section when fewer than two authors qualify.
 */
export async function getFeaturedAuthors(take = 6) {
  const profiles = await prisma.authorProfile.findMany({
    where: { user: { articles: { some: { status: "PUBLISHED" } } } },
    select: {
      slug: true,
      bio: true,
      avatarUrl: true,
      user: {
        select: {
          name: true,
          _count: {
            select: { articles: { where: { status: "PUBLISHED" } } },
          },
        },
      },
    },
  });

  return profiles
    .map((profile) => ({
      slug: profile.slug,
      name: profile.user.name,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      articleCount: profile.user._count.articles,
    }))
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, take);
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
