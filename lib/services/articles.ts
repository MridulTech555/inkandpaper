import "server-only";
import { prisma } from "@/lib/db/prisma";

const WORDS_PER_MINUTE = 200;

export const articleCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  featuredImage: true,
  publishedAt: true,
  category: { select: { id: true, name: true, slug: true } },
  author: {
    select: {
      name: true,
      authorProfile: { select: { slug: true, avatarUrl: true } },
    },
  },
} as const;

export type ArticleCardData = NonNullable<
  Awaited<ReturnType<typeof getPublishedArticles>>
>[number];

export async function getPublishedArticles(take = 20) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleCardSelect,
  });
}

export async function getArticlesByCategory(
  categoryId: string,
  skip: number,
  take: number,
) {
  return prisma.$transaction([
    prisma.article.findMany({
      where: { status: "PUBLISHED", categoryId },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      select: articleCardSelect,
    }),
    prisma.article.count({ where: { status: "PUBLISHED", categoryId } }),
  ]);
}

export async function getArticlesByAuthor(
  authorId: string,
  skip: number,
  take: number,
) {
  return prisma.$transaction([
    prisma.article.findMany({
      where: { status: "PUBLISHED", authorId },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
      select: articleCardSelect,
    }),
    prisma.article.count({ where: { status: "PUBLISHED", authorId } }),
  ]);
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      author: {
        select: {
          id: true,
          name: true,
          authorProfile: {
            select: { slug: true, avatarUrl: true, bio: true },
          },
        },
      },
      blocks: {
        orderBy: { position: "asc" },
        select: { id: true, type: true, position: true, content: true },
      },
      tags: {
        select: { tag: { select: { id: true, name: true, slug: true } } },
      },
      comments: {
        where: { status: "VISIBLE" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });
}

export async function getRelatedArticles(
  articleId: string,
  categoryId: string | null,
  take = 3,
) {
  const related = categoryId
    ? await prisma.article.findMany({
        where: { status: "PUBLISHED", categoryId, id: { not: articleId } },
        orderBy: { publishedAt: "desc" },
        take,
        select: articleCardSelect,
      })
    : [];

  if (related.length >= take) return related;

  const fallback = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { notIn: [articleId, ...related.map((article) => article.id)] },
    },
    orderBy: { publishedAt: "desc" },
    take: take - related.length,
    select: articleCardSelect,
  });

  return [...related, ...fallback];
}

interface TextBlockContent {
  text?: unknown;
}

export function blockText(content: unknown): string {
  if (content && typeof content === "object" && "text" in content) {
    const text = (content as TextBlockContent).text;
    return typeof text === "string" ? text : "";
  }
  return "";
}

export function computeReadingTime(blocks: { content: unknown }[]): number {
  const words = blocks
    .map((block) => blockText(block.content))
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export interface HeadingEntry {
  id: string;
  text: string;
  level: number;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function blockHeadingLevel(content: unknown): number {
  return content &&
    typeof content === "object" &&
    "level" in content &&
    typeof (content as { level?: unknown }).level === "number"
    ? (content as { level: number }).level
    : 2;
}

export function extractHeadings(
  blocks: { type: string; content: unknown }[],
): HeadingEntry[] {
  return blocks
    .filter((block) => block.type === "HEADING")
    .map((block) => {
      const text = blockText(block.content);
      return {
        id: slugifyHeading(text),
        text,
        level: blockHeadingLevel(block.content),
      };
    })
    .filter((heading) => heading.text.length > 0);
}

// ---------------------------------------------------------------------------
// Plain-text editor <-> blocks
//
// The author-facing editor is deliberately simple: one big textarea, not a
// visual block editor. A blank line separates blocks; "## " starts a
// heading, "> " starts a quote, anything else is a paragraph. This covers
// every block type the seed data and public rendering already support
// (PARAGRAPH/HEADING/QUOTE) without building block-level UI. Block types
// outside that set (IMAGE, GALLERY, TABLE, ...) aren't produced by this
// editor and fall back to their plain text if encountered when editing.
// ---------------------------------------------------------------------------

export interface EditableBlock {
  type: "PARAGRAPH" | "HEADING" | "QUOTE";
  content: Record<string, unknown>;
}

export function blocksToPlainText(
  blocks: { type: string; content: unknown }[],
): string {
  return blocks
    .map((block) => {
      const text = blockText(block.content);
      if (!text) return "";
      if (block.type === "HEADING") return `## ${text}`;
      if (block.type === "QUOTE") return `> ${text}`;
      return text;
    })
    .filter(Boolean)
    .join("\n\n");
}

export function plainTextToBlocks(text: string): EditableBlock[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      if (paragraph.startsWith("## ")) {
        return {
          type: "HEADING" as const,
          content: { text: paragraph.slice(3).trim(), level: 2 },
        };
      }
      if (paragraph.startsWith("> ")) {
        return {
          type: "QUOTE" as const,
          content: { text: paragraph.slice(2).trim() },
        };
      }
      return { type: "PARAGRAPH" as const, content: { text: paragraph } };
    });
}
