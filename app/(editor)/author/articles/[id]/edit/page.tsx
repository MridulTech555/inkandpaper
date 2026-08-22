import { notFound } from "next/navigation";
import { hasPermission, requirePermission } from "@/lib/permissions/check";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedArticleForEdit } from "@/lib/services/author-articles";
import { getAllCategories } from "@/lib/services/categories";
import { prisma } from "@/lib/db/prisma";
import { ArticleEditor } from "@/components/editor/article-editor";
import type { ArticleBlockInput } from "@/lib/validation/article-block";

function parseSeo(value: unknown) {
  if (!value || typeof value !== "object") {
    return {
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
      canonicalUrl: "",
    };
  }
  const record = value as Record<string, unknown>;
  return {
    metaTitle: typeof record.metaTitle === "string" ? record.metaTitle : "",
    metaDescription:
      typeof record.metaDescription === "string" ? record.metaDescription : "",
    ogImage: typeof record.ogImage === "string" ? record.ogImage : "",
    canonicalUrl:
      typeof record.canonicalUrl === "string" ? record.canonicalUrl : "",
  };
}

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({
  params,
}: EditArticlePageProps) {
  const { id } = await params;
  await requirePermission("article:update");
  const user = await getCurrentUser();

  const [article, categories, tags] = await Promise.all([
    getOwnedArticleForEdit(id, user!.id),
    getAllCategories(),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!article) notFound();

  return (
    <ArticleEditor
      article={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt ?? "",
        status: article.status,
        blocks: article.blocks.map((block) => ({
          type: block.type as ArticleBlockInput["type"],
          content: block.content as Record<string, unknown>,
        })),
        publishInitialValues: {
          featuredImage: article.featuredImage ?? "",
          categoryId: article.categoryId ?? "",
          tagIds: article.tags.map((tag) => tag.tagId),
          ...parseSeo(article.seo),
        },
      }}
      categories={categories}
      tags={tags}
      canPublish={hasPermission(user, "article:publish")}
    />
  );
}
