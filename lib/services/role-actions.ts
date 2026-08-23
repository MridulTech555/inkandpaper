"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/permissions/check";
import { logAudit } from "@/lib/services/audit-log";

export interface RoleActionResult {
  error?: string;
}

/**
 * SUPER_ADMIN's own permission set can't be edited — it must always retain
 * every permission, or the person managing roles could lock themselves out.
 */
const PROTECTED_ROLE = "SUPER_ADMIN";

export async function toggleRolePermissionAction(
  roleId: string,
  permissionId: string,
  grant: boolean,
): Promise<RoleActionResult> {
  const admin = await requirePermission("role:manage");

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    select: { id: true, name: true },
  });
  if (!role) return { error: "That role doesn't exist." };
  if (role.name === PROTECTED_ROLE) {
    return { error: "Super Admin's permissions can't be changed." };
  }

  if (grant) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      update: {},
      create: { roleId, permissionId },
    });
  } else {
    await prisma.rolePermission.deleteMany({ where: { roleId, permissionId } });
  }

  await logAudit({
    userId: admin.id,
    action: grant ? "role.permission_granted" : "role.permission_revoked",
    entity: "Role",
    entityId: roleId,
    metadata: { permissionId },
  });

  revalidatePath("/admin/roles");
  return {};
}
