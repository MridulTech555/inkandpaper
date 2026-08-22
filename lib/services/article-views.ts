import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Records a pageview for an article. Anonymous views are each counted as
 * a distinct "unique reader" (there is no visitor-tracking cookie in this
 * foundation build), while logged-in views dedupe correctly by userId.
 */
export async function recordArticleView(
  articleId: string,
  viewerId: string | null,
): Promise<void> {
  await prisma.articleView.create({
    data: { articleId, userId: viewerId },
  });
}
