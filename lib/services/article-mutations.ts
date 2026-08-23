"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { isManagerRole, requirePermission } from "@/lib/permissions/check";
import type { SessionUser } from "@/lib/auth/session";
import {
  createNotification,
  notifyUsersWithPermission,
} from "@/lib/services/notifications";
import {
  draftSaveSchema,
  publishSettingsSchema,
  type DraftSaveInput,
  type PublishSettingsInput,
} from "@/lib/validation/article";

/** Statuses in which block/title content may still be autosaved. */
const CONTENT_EDITABLE_STATUSES: ArticleStatus[] = [
  "DRAFT",
  "CHANGES_REQUESTED",
  "PUBLISHED",
];

async function assertSlugAvailable(slug: string, excludeArticleId?: string) {
  const existing = await prisma.article.findUnique({
    where: { slug },
    select: { id: true },
  });
  return !existing || existing.id === excludeArticleId;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlugFrom(base: string): Promise<string> {
  let candidate = base || "untitled";
  let suffix = 2;
  while (!(await assertSlugAvailable(candidate))) {
    candidate = `${base || "untitled"}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

/**
 * Looks up an article and verifies the CURRENT session user may edit it —
 * either they're its author, or they hold a manager role (SUPER_ADMIN,
 * ADMIN, EDITOR) that can act on any article. Every mutation below calls
 * this instead of trusting the articleId a client sent — the check is
 * re-run against the database on every call, never cached from a prior read.
 */
async function requireOwnedArticle(articleId: string, user: SessionUser) {
  const isManager = isManagerRole(user);
  return prisma.article.findFirst({
    where: isManager ? { id: articleId } : { id: articleId, authorId: user.id },
    select: { id: true, slug: true, status: true, authorId: true, title: true },
  });
}

export async function createDraftArticleAction(): Promise<void> {
  const user = await requirePermission("article:create");

  const slug = await uniqueSlugFrom(`untitled-${randomUUID().slice(0, 8)}`);

  const article = await prisma.article.create({
    data: {
      title: "Untitled",
      slug,
      status: "DRAFT",
      authorId: user.id,
    },
    select: { id: true },
  });

  revalidatePath("/author/articles");
  redirect(`/author/articles/${article.id}/edit`);
}

export interface SaveContentResult {
  error?: string;
  savedAt?: string;
  slug?: string;
}

export async function saveArticleContentAction(
  articleId: string,
  payload: DraftSaveInput,
): Promise<SaveContentResult> {
  const user = await requirePermission("article:update");

  const owned = await requireOwnedArticle(articleId, user);
  if (!owned) {
    return { error: "You can only edit your own articles." };
  }

  if (!CONTENT_EDITABLE_STATUSES.includes(owned.status)) {
    return { error: "This article can't be edited in its current status." };
  }

  const parsed = draftSaveSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: "Couldn't save — check the content and try again." };
  }
  const data = parsed.data;

  const title = data.title.trim() || "Untitled";
  const desiredSlug = data.slug ? slugify(data.slug) : owned.slug;
  const slug =
    desiredSlug === owned.slug ||
    (await assertSlugAvailable(desiredSlug, articleId))
      ? desiredSlug || owned.slug
      : owned.slug;

  await prisma.$transaction([
    prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        slug,
        excerpt: data.subtitle?.trim() || null,
      },
    }),
    prisma.articleBlock.deleteMany({ where: { articleId } }),
    ...(data.blocks.length > 0
      ? [
          prisma.articleBlock.createMany({
            data: data.blocks.map((block, index) => ({
              articleId,
              type: block.type,
              content: block.content as Prisma.InputJsonValue,
              position: index,
            })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/author/articles");
  if (owned.status === "PUBLISHED") revalidatePath(`/article/${slug}`);

  return { savedAt: new Date().toISOString(), slug };
}

export interface WorkflowActionResult {
  error?: string;
}

export async function submitForReviewAction(
  articleId: string,
): Promise<WorkflowActionResult> {
  const user = await requirePermission("article:update");

  const owned = await requireOwnedArticle(articleId, user);
  if (!owned) {
    return { error: "You can only submit your own articles." };
  }
  if (owned.status !== "DRAFT" && owned.status !== "CHANGES_REQUESTED") {
    return { error: "Only drafts can be submitted for review." };
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { title: true, _count: { select: { blocks: true } } },
  });

  if (!article || article.title.trim().length < 3) {
    return { error: "Give the article a title before submitting." };
  }
  if (article._count.blocks === 0) {
    return { error: "Add at least one block before submitting." };
  }

  await prisma.article.update({
    where: { id: articleId },
    data: { status: "IN_REVIEW" },
  });

  await notifyUsersWithPermission("article:review", {
    type: "article_submitted",
    title: "Article submitted for review",
    message: `"${article.title}" is ready for your review.`,
    metadata: { articleId },
  });

  revalidatePath("/author/articles");
  return {};
}

export async function publishArticleAction(
  articleId: string,
  payload: PublishSettingsInput,
): Promise<WorkflowActionResult> {
  const user = await requirePermission("article:publish");

  const owned = await requireOwnedArticle(articleId, user);
  if (!owned) {
    return { error: "You can only publish your own articles." };
  }
  if (owned.status === "ARCHIVED") {
    return { error: "Archived articles can't be published directly." };
  }

  const parsed = publishSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Check the publish settings and try again.",
    };
  }
  const data = parsed.data;

  const blockCount = await prisma.articleBlock.count({ where: { articleId } });
  if (blockCount === 0) {
    return { error: "Add at least one block before publishing." };
  }

  const isScheduled = data.mode === "schedule";

  await prisma.$transaction([
    prisma.article.update({
      where: { id: articleId },
      data: {
        featuredImage: data.featuredImage || null,
        categoryId: data.categoryId || null,
        status: isScheduled ? "SCHEDULED" : "PUBLISHED",
        publishedAt: isScheduled ? null : new Date(),
        scheduledAt: isScheduled ? new Date(data.scheduledAt!) : null,
        seo: data.seo
          ? ({
              metaTitle: data.seo.metaTitle || undefined,
              metaDescription: data.seo.metaDescription || undefined,
              ogImage: data.seo.ogImage || undefined,
              canonicalUrl: data.seo.canonicalUrl || undefined,
            } satisfies Prisma.InputJsonValue)
          : undefined,
      },
    }),
    prisma.articleTag.deleteMany({ where: { articleId } }),
    ...(data.tagIds.length > 0
      ? [
          prisma.articleTag.createMany({
            data: data.tagIds.map((tagId) => ({ articleId, tagId })),
          }),
        ]
      : []),
  ]);

  if (!isScheduled && owned.authorId !== user.id) {
    await createNotification({
      userId: owned.authorId,
      type: "article_published",
      title: "Article published",
      message: `"${owned.title}" is now live.`,
      metadata: { articleId },
    });
  }

  revalidatePath("/author/articles");
  revalidatePath(`/article/${owned.slug}`);
  return {};
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
      seo: true,
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

  const slug = await uniqueSlugFrom(`${original.slug}-copy`);

  const copy = await prisma.article.create({
    data: {
      title: `Copy of ${original.title}`,
      slug,
      excerpt: original.excerpt,
      featuredImage: original.featuredImage,
      status: "DRAFT",
      authorId: user.id,
      categoryId: original.categoryId,
      seo: original.seo ?? undefined,
      blocks: {
        create: original.blocks.map((block) => ({
          type: block.type,
          position: block.position,
          content: block.content as Prisma.InputJsonValue,
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

  const owned = await requireOwnedArticle(articleId, user);
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

  const owned = await requireOwnedArticle(articleId, user);
  if (!owned) {
    return { error: "You can only delete your own articles." };
  }

  await prisma.article.delete({ where: { id: articleId } });
  revalidatePath("/author/articles");
  return {};
}
