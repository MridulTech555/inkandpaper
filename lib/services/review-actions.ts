"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/permissions/check";
import { logAudit } from "@/lib/services/audit-log";

export interface ReviewActionResult {
  error?: string;
}

async function requireInReviewArticle(articleId: string) {
  return prisma.article.findFirst({
    where: { id: articleId, status: "IN_REVIEW" },
    select: { id: true, slug: true },
  });
}

export async function approveArticleAction(
  articleId: string,
): Promise<ReviewActionResult> {
  const reviewer = await requirePermission("article:review");

  const article = await requireInReviewArticle(articleId);
  if (!article) return { error: "This article is no longer awaiting review." };

  await prisma.$transaction([
    prisma.article.update({
      where: { id: articleId },
      data: { status: "APPROVED" },
    }),
    prisma.articleReview.create({
      data: { articleId, reviewerId: reviewer.id, status: "APPROVED" },
    }),
  ]);

  await logAudit({
    userId: reviewer.id,
    action: "article.approved",
    entity: "Article",
    entityId: articleId,
  });

  revalidatePath("/admin/review");
  revalidatePath("/admin/articles");
  return {};
}

export async function requestChangesArticleAction(
  articleId: string,
  feedback: string,
): Promise<ReviewActionResult> {
  const reviewer = await requirePermission("article:review");

  if (feedback.trim().length === 0) {
    return { error: "Explain what needs to change before requesting edits." };
  }

  const article = await requireInReviewArticle(articleId);
  if (!article) return { error: "This article is no longer awaiting review." };

  await prisma.$transaction([
    prisma.article.update({
      where: { id: articleId },
      data: { status: "CHANGES_REQUESTED" },
    }),
    prisma.articleReview.create({
      data: {
        articleId,
        reviewerId: reviewer.id,
        status: "CHANGES_REQUESTED",
        comment: feedback.trim(),
      },
    }),
  ]);

  await logAudit({
    userId: reviewer.id,
    action: "article.changes_requested",
    entity: "Article",
    entityId: articleId,
    metadata: { feedback: feedback.trim() },
  });

  revalidatePath("/admin/review");
  revalidatePath("/admin/articles");
  return {};
}

export async function rejectArticleAction(
  articleId: string,
  feedback?: string,
): Promise<ReviewActionResult> {
  const reviewer = await requirePermission("article:review");

  const article = await requireInReviewArticle(articleId);
  if (!article) return { error: "This article is no longer awaiting review." };

  await prisma.$transaction([
    prisma.article.update({
      where: { id: articleId },
      data: { status: "REJECTED" },
    }),
    prisma.articleReview.create({
      data: {
        articleId,
        reviewerId: reviewer.id,
        status: "REJECTED",
        comment: feedback?.trim() || null,
      },
    }),
  ]);

  await logAudit({
    userId: reviewer.id,
    action: "article.rejected",
    entity: "Article",
    entityId: articleId,
  });

  revalidatePath("/admin/review");
  revalidatePath("/admin/articles");
  return {};
}
