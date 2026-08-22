import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getAuthorMedia(userId: string, query?: string) {
  return prisma.media.findMany({
    where: {
      uploadedBy: userId,
      ...(query
        ? { filename: { contains: query, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      url: true,
      filename: true,
      mimeType: true,
      size: true,
      width: true,
      height: true,
      altText: true,
      createdAt: true,
    },
  });
}
