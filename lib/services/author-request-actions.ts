"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/permissions/check";
import { logAudit } from "@/lib/services/audit-log";

export interface AuthorRequestActionResult {
  error?: string;
}

export async function approveAuthorRequestAction(
  requestId: string,
): Promise<AuthorRequestActionResult> {
  const admin = await requirePermission("author:manage");

  const request = await prisma.authorRequest.findFirst({
    where: { id: requestId, status: "PENDING" },
    select: { id: true, userId: true },
  });
  if (!request) return { error: "This request is no longer pending." };

  const authorRole = await prisma.role.findUnique({
    where: { name: "AUTHOR" },
    select: { id: true },
  });
  if (!authorRole) return { error: "AUTHOR role is missing." };

  const user = await prisma.user.findUnique({
    where: { id: request.userId },
    select: { id: true, name: true },
  });
  if (!user) return { error: "That user no longer exists." };

  await prisma.$transaction([
    prisma.user.update({
      where: { id: request.userId },
      data: { roleId: authorRole.id },
    }),
    prisma.authorProfile.upsert({
      where: { userId: request.userId },
      update: {},
      create: {
        userId: request.userId,
        slug: `${user.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}-${randomUUID().slice(0, 6)}`,
      },
    }),
    prisma.authorRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedById: admin.id,
        reviewedAt: new Date(),
      },
    }),
  ]);

  await logAudit({
    userId: admin.id,
    action: "author_request.approved",
    entity: "AuthorRequest",
    entityId: requestId,
    metadata: { userId: request.userId },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/authors");
  revalidatePath("/admin/users");
  return {};
}

export async function rejectAuthorRequestAction(
  requestId: string,
): Promise<AuthorRequestActionResult> {
  const admin = await requirePermission("author:manage");

  const request = await prisma.authorRequest.findFirst({
    where: { id: requestId, status: "PENDING" },
    select: { id: true },
  });
  if (!request) return { error: "This request is no longer pending." };

  await prisma.authorRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  await logAudit({
    userId: admin.id,
    action: "author_request.rejected",
    entity: "AuthorRequest",
    entityId: requestId,
  });

  revalidatePath("/admin");
  return {};
}
