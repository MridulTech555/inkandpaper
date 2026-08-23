import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAccountProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      role: { select: { name: true } },
    },
  });
}

export async function getAccountActivityCounts(userId: string) {
  const [comments, likes, bookmarks] = await Promise.all([
    prisma.comment.count({
      where: { userId, status: { in: ["VISIBLE", "REPORTED"] } },
    }),
    prisma.like.count({ where: { userId } }),
    prisma.bookmark.count({ where: { userId } }),
  ]);
  return { comments, likes, bookmarks };
}

export async function getRecentComments(userId: string, take = 5) {
  return prisma.comment.findMany({
    where: { userId, status: { in: ["VISIBLE", "REPORTED"] } },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      content: true,
      createdAt: true,
      article: { select: { title: true, slug: true } },
    },
  });
}

export async function getRecentLikes(userId: string, take = 5) {
  return prisma.like.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      createdAt: true,
      article: { select: { title: true, slug: true } },
    },
  });
}
