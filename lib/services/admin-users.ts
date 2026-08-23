import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface AdminUserFilters {
  search?: string;
  roleId?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export async function getAdminUsers(filters: AdminUserFilters) {
  const where: Prisma.UserWhereInput = {
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.roleId ? { roleId: filters.roleId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };

  return prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      role: { select: { id: true, name: true } },
    },
  });
}

export type AdminUserListItem = Awaited<
  ReturnType<typeof getAdminUsers>
>[number];

export async function getAllRoles() {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
