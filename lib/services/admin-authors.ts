import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAdminAuthors() {
  const authors = await prisma.user.findMany({
    where: { role: { name: "AUTHOR" } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      authorProfile: { select: { slug: true, avatarUrl: true } },
      _count: { select: { articles: true } },
      sessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  return authors.map((author) => ({
    id: author.id,
    name: author.name,
    email: author.email,
    status: author.status,
    slug: author.authorProfile?.slug ?? null,
    avatarUrl: author.authorProfile?.avatarUrl ?? null,
    articleCount: author._count.articles,
    lastActiveAt: author.sessions[0]?.createdAt ?? null,
  }));
}

export type AdminAuthorListItem = Awaited<
  ReturnType<typeof getAdminAuthors>
>[number];

export async function getAdminAuthorDetail(authorId: string) {
  const user = await prisma.user.findFirst({
    where: { id: authorId, role: { name: "AUTHOR" } },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      role: {
        select: {
          name: true,
          permissions: { select: { permission: { select: { name: true } } } },
        },
      },
      authorProfile: {
        select: { slug: true, bio: true, avatarUrl: true, socialLinks: true },
      },
    },
  });

  return user;
}

export async function getAuthorActivity(authorId: string, take = 10) {
  const [reviews, sessions] = await Promise.all([
    prisma.articleReview.findMany({
      where: { article: { authorId } },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        status: true,
        comment: true,
        createdAt: true,
        article: { select: { title: true } },
        reviewer: { select: { name: true } },
      },
    }),
    prisma.session.findMany({
      where: { userId: authorId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { createdAt: true },
    }),
  ]);

  return { reviews, sessions };
}
