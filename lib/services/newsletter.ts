import "server-only";
import type { Prisma, SubscriberStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export interface SubscriberFilters {
  search?: string;
  status?: SubscriberStatus;
}

export async function getNewsletterSubscribers(filters: SubscriberFilters) {
  const where: Prisma.NewsletterSubscriberWhereInput = {
    ...(filters.search
      ? { email: { contains: filters.search, mode: "insensitive" } }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };

  return prisma.newsletterSubscriber.findMany({
    where,
    orderBy: { subscribedAt: "desc" },
  });
}

export async function getNewsletterSubscriberCounts() {
  const [subscribed, unsubscribed] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { status: "SUBSCRIBED" } }),
    prisma.newsletterSubscriber.count({ where: { status: "UNSUBSCRIBED" } }),
  ]);
  return { subscribed, unsubscribed };
}
