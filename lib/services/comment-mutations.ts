"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions/check";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { commentContentSchema } from "@/lib/validation/comment";
import { notifyUsersWithPermission } from "@/lib/services/notifications";

export interface CommentActionResult {
  error?: string;
}

export async function createCommentAction(
  articleId: string,
  articlePath: string,
  content: string,
): Promise<CommentActionResult> {
  const user = await requireUser();

  if (!checkRateLimit(`comment-create:${user.id}`, 10, 60_000)) {
    return { error: "You're commenting too fast. Please slow down." };
  }

  const parsed = commentContentSchema.safeParse(content);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment." };
  }

  const article = await prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!article) return { error: "This article can't be commented on." };

  await prisma.comment.create({
    data: { articleId, userId: user.id, content: parsed.data },
  });

  revalidatePath(articlePath);
  return {};
}

async function requireOwnComment(commentId: string, userId: string) {
  return prisma.comment.findFirst({
    where: { id: commentId, userId },
    select: { id: true, articleId: true },
  });
}

export async function updateCommentAction(
  commentId: string,
  articlePath: string,
  content: string,
): Promise<CommentActionResult> {
  const user = await requireUser();

  const owned = await requireOwnComment(commentId, user.id);
  if (!owned) return { error: "You can only edit your own comments." };

  const parsed = commentContentSchema.safeParse(content);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment." };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { content: parsed.data },
  });

  revalidatePath(articlePath);
  return {};
}

export async function deleteOwnCommentAction(
  commentId: string,
  articlePath: string,
): Promise<CommentActionResult> {
  const user = await requireUser();

  const owned = await requireOwnComment(commentId, user.id);
  if (!owned) return { error: "You can only delete your own comments." };

  await prisma.comment.update({
    where: { id: commentId },
    data: { status: "DELETED" },
  });

  revalidatePath(articlePath);
  return {};
}

export async function reportCommentAction(
  commentId: string,
  articlePath: string,
): Promise<CommentActionResult> {
  const user = await requireUser();

  if (!checkRateLimit(`comment-report:${user.id}`, 10, 60_000)) {
    return { error: "Too many reports. Please try again later." };
  }

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, status: "VISIBLE" },
    select: { id: true, content: true },
  });
  if (!comment) return { error: "This comment can't be reported." };

  await prisma.comment.update({
    where: { id: commentId },
    data: { status: "REPORTED" },
  });

  await notifyUsersWithPermission("comment:moderate", {
    type: "comment_reported",
    title: "A comment was reported",
    message: comment.content.slice(0, 140),
    metadata: { commentId, reportedBy: user.id },
  });

  revalidatePath(articlePath);
  return {};
}
