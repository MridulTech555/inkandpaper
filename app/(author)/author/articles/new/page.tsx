import { hasPermission, requirePermission } from "@/lib/permissions/check";
import { getCurrentUser } from "@/lib/auth/session";
import { getAllCategories } from "@/lib/services/categories";
import { prisma } from "@/lib/db/prisma";
import { H1 } from "@/components/ui/typography";
import { ArticleForm } from "@/components/author/article-form";

export default async function NewArticlePage() {
  await requirePermission("article:create");
  const user = await getCurrentUser();

  const [categories, tags] = await Promise.all([
    getAllCategories(),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Write a new article</H1>
      <ArticleForm
        mode="create"
        values={{
          title: "",
          slug: "",
          excerpt: "",
          featuredImage: "",
          categoryId: "",
          tagIds: [],
          content: "",
          status: "DRAFT",
          scheduledAt: "",
        }}
        categories={categories}
        tags={tags}
        canPublish={hasPermission(user, "article:publish")}
      />
    </div>
  );
}
