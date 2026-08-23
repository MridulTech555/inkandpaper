"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/permissions/check";

export interface NotificationActionResult {
  error?: string;
}

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionResult> {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  return {};
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionResult> {
  const user = await requireUser();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/notifications");
  return {};
}
