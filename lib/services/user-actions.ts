"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/permissions/check";
import { logAudit } from "@/lib/services/audit-log";

export interface UserActionResult {
  error?: string;
}

export async function changeUserRoleAction(
  userId: string,
  roleId: string,
): Promise<UserActionResult> {
  const admin = await requirePermission("user:update");

  if (userId === admin.id) {
    return { error: "You can't change your own role." };
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { id: true, name: true },
  });
  if (!role) return { error: "That role doesn't exist." };

  await prisma.user.update({ where: { id: userId }, data: { roleId } });

  await logAudit({
    userId: admin.id,
    action: "user.role_changed",
    entity: "User",
    entityId: userId,
    metadata: { roleName: role.name },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/authors");
  return {};
}

export async function setUserStatusAction(
  userId: string,
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED",
): Promise<UserActionResult> {
  const admin = await requirePermission("user:update");

  if (userId === admin.id) {
    return { error: "You can't change your own status." };
  }

  await prisma.user.update({ where: { id: userId }, data: { status } });

  await logAudit({
    userId: admin.id,
    action: status === "ACTIVE" ? "user.activated" : "user.deactivated",
    entity: "User",
    entityId: userId,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/authors");
  return {};
}
