"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export interface BookmarkActionResult {
  bookmarked: boolean;
  error?: string;
}

export async function toggleBookmarkAction(
  articleId: string,
  articlePath: string,
): Promise<BookmarkActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { bookmarked: false, error: "Log in to bookmark articles." };
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_articleId: { userId: user.id, articleId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    revalidatePath(articlePath);
    return { bookmarked: false };
  }

  await prisma.bookmark.create({ data: { userId: user.id, articleId } });
  revalidatePath(articlePath);
  return { bookmarked: true };
}
