import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { PermissionName } from "@/lib/permissions/permissions";

export type NotificationType =
  | "article_submitted"
  | "article_approved"
  | "article_changes_requested"
  | "article_rejected"
  | "article_published"
  | "comment_reported"
  | "author_request_created"
  | "author_request_approved"
  | "author_request_rejected";

export async function createNotification(entry: {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: entry.userId,
      type: entry.type,
      title: entry.title,
      message: entry.message,
      metadata: entry.metadata,
    },
  });
}

/** Notifies every user whose role grants the given permission — e.g. every moderator when a comment is reported. */
export async function notifyUsersWithPermission(
  permission: PermissionName,
  entry: {
    type: NotificationType;
    title: string;
    message?: string;
    metadata?: Prisma.InputJsonValue;
  },
): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      role: { permissions: { some: { permission: { name: permission } } } },
    },
    select: { id: true },
  });

  if (users.length === 0) return;

  await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      type: entry.type,
      title: entry.title,
      message: entry.message,
      metadata: entry.metadata,
    })),
  });
}

export async function getUserNotifications(userId: string, take = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
