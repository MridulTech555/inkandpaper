"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export interface LikeActionResult {
  liked: boolean;
  count: number;
  error?: string;
}

export async function toggleLikeAction(
  articleId: string,
  articlePath: string,
): Promise<LikeActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    const count = await prisma.like.count({ where: { articleId } });
    return { liked: false, count, error: "Log in to like articles." };
  }

  const existing = await prisma.like.findUnique({
    where: { userId_articleId: { userId: user.id, articleId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    // The @@unique([userId, articleId]) constraint on Like is the real
    // guard against duplicates under concurrent clicks — this findUnique
    // check just avoids a wasted round trip in the common case.
    await prisma.like.create({ data: { userId: user.id, articleId } });
  }

  const count = await prisma.like.count({ where: { articleId } });
  revalidatePath(articlePath);
  return { liked: !existing, count };
}
