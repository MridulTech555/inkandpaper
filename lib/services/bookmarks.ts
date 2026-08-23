import "server-only";
import { prisma } from "@/lib/db/prisma";
import { articleCardSelect } from "@/lib/services/articles";

export async function getBookmarkedArticles(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { article: { select: articleCardSelect } },
  });

  return bookmarks.map((bookmark) => bookmark.article);
}
