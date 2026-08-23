import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getRolesWithPermissions() {
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      permissions: { select: { permission: { select: { name: true } } } },
    },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    permissionNames: new Set(role.permissions.map((rp) => rp.permission.name)),
  }));
}

export type RoleWithPermissions = Awaited<
  ReturnType<typeof getRolesWithPermissions>
>[number];
