"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/permissions/check";
import { logAudit } from "@/lib/services/audit-log";

export interface CommentActionResult {
  error?: string;
}

const VALID_STATUSES = ["VISIBLE", "HIDDEN", "REPORTED"] as const;

export async function setCommentStatusAction(
  commentId: string,
  status: "VISIBLE" | "HIDDEN" | "REPORTED",
): Promise<CommentActionResult> {
  const admin = await requirePermission("comment:moderate");

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  await prisma.comment.update({ where: { id: commentId }, data: { status } });

  await logAudit({
    userId: admin.id,
    action: `comment.${status.toLowerCase()}`,
    entity: "Comment",
    entityId: commentId,
  });

  revalidatePath("/admin/comments");
  return {};
}

export async function deleteCommentAction(
  commentId: string,
): Promise<CommentActionResult> {
  const admin = await requirePermission("comment:moderate");

  await prisma.comment.delete({ where: { id: commentId } });

  await logAudit({
    userId: admin.id,
    action: "comment.deleted",
    entity: "Comment",
    entityId: commentId,
  });

  revalidatePath("/admin/comments");
  return {};
}
