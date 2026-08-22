"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hasPermission, requirePermission } from "@/lib/permissions/check";
import { articleFormSchema } from "@/lib/validation/article";
import { plainTextToBlocks } from "@/lib/services/articles";

export interface ArticleFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function parseFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") || undefined,
    featuredImage: formData.get("featuredImage") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    tagIds: formData.getAll("tagIds"),
    content: formData.get("content"),
    status: formData.get("status"),
    scheduledAt: formData.get("scheduledAt") || undefined,
  };
}

async function assertSlugAvailable(slug: string, excludeArticleId?: string) {
  const existing = await prisma.article.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !existing || existing.id === excludeArticleId;
}

async function requireOwnedArticle(articleId: string, authorId: string) {
  const article = await prisma.article.findFirst({
    where: { id: articleId, authorId },
    select: { id: true, slug: true, status: true },
  });
  return article;
}

export async function createArticleAction(
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const user = await requirePermission("article:create");

  const parsed = articleFormSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  if (!(await assertSlugAvailable(data.slug))) {
    return { fieldErrors: { slug: ["That slug is already in use."] } };
  }

  const status = data.status ?? "DRAFT";
  if (
    (status === "PUBLISHED" || status === "SCHEDULED") &&
    !hasPermission(user, "article:publish")
  ) {
    return {
      fieldErrors: {
        status: ["You don't have permission to publish or schedule articles."],
      },
    };
  }

  const blocks = plainTextToBlocks(data.content);
  const isPublished = status === "PUBLISHED";

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      featuredImage: data.featuredImage || null,
      status,
      authorId: user.id,
      categoryId: data.categoryId || null,
      publishedAt: isPublished ? new Date() : null,
      scheduledAt: status === "SCHEDULED" ? new Date(data.scheduledAt!) : null,
      blocks: {
        create: blocks.map((block, index) => ({
          type: block.type,
          content: block.content as Prisma.InputJsonValue,
          position: index,
        })),
      },
      tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
    },
    select: { id: true },
  });

  revalidatePath("/author/articles");
  redirect(`/author/articles/${article.id}/edit`);
}

export async function updateArticleAction(
  articleId: string,
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const user = await requirePermission("article:update");

  const owned = await requireOwnedArticle(articleId, user.id);
  if (!owned) {
    return { error: "You can only edit your own articles." };
  }

  const parsed = articleFormSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  if (!(await assertSlugAvailable(data.slug, articleId))) {
    return { fieldErrors: { slug: ["That slug is already in use."] } };
  }

  const status = data.status ?? owned.status;
  if (
    (status === "PUBLISHED" || status === "SCHEDULED") &&
    !hasPermission(user, "article:publish")
  ) {
    return {
      fieldErrors: {
        status: ["You don't have permission to publish or schedule articles."],
      },
    };
  }

  const blocks = plainTextToBlocks(data.content);
  const isPublished = status === "PUBLISHED";

  await prisma.$transaction([
    prisma.article.update({
      where: { id: articleId },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        featuredImage: data.featuredImage || null,
        status,
        categoryId: data.categoryId || null,
        publishedAt: isPublished ? new Date() : null,
        scheduledAt:
          status === "SCHEDULED" ? new Date(data.scheduledAt!) : null,
      },
    }),
    prisma.articleBlock.deleteMany({ where: { articleId } }),
    prisma.articleBlock.createMany({
      data: blocks.map((block, index) => ({
        type: block.type,
        content: block.content as Prisma.InputJsonValue,
        articleId,
        position: index,
      })),
    }),
    prisma.articleTag.deleteMany({ where: { articleId } }),
    prisma.articleTag.createMany({
      data: data.tagIds.map((tagId) => ({ articleId, tagId })),
    }),
  ]);

  revalidatePath("/author/articles");
  revalidatePath(`/article/${data.slug}`);
  redirect("/author/articles");
}

export async function duplicateArticleAction(
  articleId: string,
): Promise<{ error?: string }> {
  const user = await requirePermission("article:create");

  const original = await prisma.article.findFirst({
    where: { id: articleId, authorId: user.id },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      categoryId: true,
      blocks: {
        orderBy: { position: "asc" },
        select: { type: true, position: true, content: true },
      },
      tags: { select: { tagId: true } },
    },
  });

  if (!original) {
    return { error: "You can only duplicate your own articles." };
  }

  let slug = `${original.slug}-copy`;
  let suffix = 2;
  while (!(await assertSlugAvailable(slug))) {
    slug = `${original.slug}-copy-${suffix}`;
    suffix += 1;
  }

  const copy = await prisma.article.create({
    data: {
      title: `Copy of ${original.title}`,
      slug,
      excerpt: original.excerpt,
      featuredImage: original.featuredImage,
      status: "DRAFT",
      authorId: user.id,
      categoryId: original.categoryId,
      blocks: {
        create: original.blocks.map((block) => ({
          type: block.type,
          position: block.position,
          content: block.content as object,
        })),
      },
      tags: { create: original.tags.map((tag) => ({ tagId: tag.tagId })) },
    },
    select: { id: true },
  });

  revalidatePath("/author/articles");
  redirect(`/author/articles/${copy.id}/edit`);
}

export async function archiveArticleAction(
  articleId: string,
): Promise<{ error?: string }> {
  const user = await requirePermission("article:update");

  const owned = await requireOwnedArticle(articleId, user.id);
  if (!owned) {
    return { error: "You can only archive your own articles." };
  }

  await prisma.article.update({
    where: { id: articleId },
    data: { status: "ARCHIVED" },
  });
  revalidatePath("/author/articles");
  return {};
}

export async function deleteArticleAction(
  articleId: string,
): Promise<{ error?: string }> {
  const user = await requirePermission("article:delete");

  const owned = await requireOwnedArticle(articleId, user.id);
  if (!owned) {
    return { error: "You can only delete your own articles." };
  }

  await prisma.article.delete({ where: { id: articleId } });
  revalidatePath("/author/articles");
  return {};
}
