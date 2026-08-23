import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function logAudit(entry: {
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      metadata: entry.metadata,
    },
  });
}

export interface AuditLogFilters {
  entity?: string;
  action?: string;
  search?: string;
}

export async function getAuditLogs(
  filters: AuditLogFilters,
  skip: number,
  take: number,
) {
  const where: Prisma.AuditLogWhereInput = {
    ...(filters.entity ? { entity: filters.entity } : {}),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.search
      ? {
          OR: [
            { action: { contains: filters.search, mode: "insensitive" } },
            { entity: { contains: filters.search, mode: "insensitive" } },
            { entityId: { contains: filters.search, mode: "insensitive" } },
            {
              user: {
                is: { name: { contains: filters.search, mode: "insensitive" } },
              },
            },
          ],
        }
      : {}),
  };

  return prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        metadata: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);
}

export async function getAuditLogEntityOptions(): Promise<string[]> {
  const rows = await prisma.auditLog.findMany({
    distinct: ["entity"],
    select: { entity: true },
    orderBy: { entity: "asc" },
  });
  return rows.map((row) => row.entity);
}
