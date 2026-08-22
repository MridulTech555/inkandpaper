import { notFound } from "next/navigation";
import { hasPermission, requirePermission } from "@/lib/permissions/check";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedArticleForEdit } from "@/lib/services/author-articles";
import { getAllCategories } from "@/lib/services/categories";
import { blocksToPlainText } from "@/lib/services/articles";
import { prisma } from "@/lib/db/prisma";
import { H1 } from "@/components/ui/typography";
import { ArticleForm } from "@/components/author/article-form";

function toDatetimeLocal(date: Date | null): string {
  if (!date) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Edit article</H1>
      <ArticleForm
        mode="edit"
        values={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? "",
          featuredImage: article.featuredImage ?? "",
          categoryId: article.categoryId ?? "",
          tagIds: article.tags.map((tag) => tag.tagId),
          content: blocksToPlainText(article.blocks),
          status: article.status,
          scheduledAt: toDatetimeLocal(article.scheduledAt),
        }}
        categories={categories}
        tags={tags}
        canPublish={hasPermission(user, "article:publish")}
      />
    </div>
  );
}
