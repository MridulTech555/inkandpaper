import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories, authors] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.authorProfile.findMany({
      where: { user: { articles: { some: { status: "PUBLISHED" } } } },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    {
      url: `${siteConfig.url}/search`,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...articles.map((article) => ({
      url: `${siteConfig.url}/article/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `${siteConfig.url}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...authors.map((author) => ({
      url: `${siteConfig.url}/author/${author.slug}`,
      lastModified: author.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
