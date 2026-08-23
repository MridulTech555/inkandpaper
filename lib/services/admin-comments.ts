import "server-only";
import type { CommentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getAdminComments(status?: CommentStatus) {
  const where: Prisma.CommentWhereInput = status ? { status } : {};

  return prisma.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      status: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
      article: { select: { id: true, title: true, slug: true } },
    },
  });
}

export type AdminCommentListItem = Awaited<
  ReturnType<typeof getAdminComments>
>[number];
