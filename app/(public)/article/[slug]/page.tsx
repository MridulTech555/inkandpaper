import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  computeReadingTime,
  extractHeadings,
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/services/articles";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { siteConfig } from "@/config/site";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { ArticleTitle, BodyLarge } from "@/components/ui/typography";
import { ArticleCard } from "@/components/blog/article-card";
import { ArticleSection } from "@/components/blog/article-section";
import { ArticleContent } from "@/components/blog/article-content";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { CommentsList } from "@/components/blog/comments-list";
import { AuthorBio } from "@/components/blog/author-bio";
import { BookmarkButton } from "@/components/blog/bookmark-button";
import { ShareButton } from "@/components/blog/share-button";
import { NewsletterCta } from "@/components/blog/newsletter-cta";

export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name],
      images: article.featuredImage
        ? [{ url: article.featuredImage }]
        : undefined,
      url: `${siteConfig.url}/article/${article.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.featuredImage ? [article.featuredImage] : undefined,
    },
  };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [relatedArticles, currentUser] = await Promise.all([
    getRelatedArticles(article.id, article.category?.id ?? null),
    getCurrentUser(),
  ]);

  const initialBookmarked = currentUser
    ? Boolean(
        await prisma.bookmark.findUnique({
          where: {
            userId_articleId: { userId: currentUser.id, articleId: article.id },
          },
          select: { id: true },
        }),
      )
    : false;

  const readingTime = computeReadingTime(article.blocks);
  const headings = extractHeadings(article.blocks);
  const articlePath = `/article/${article.slug}`;

  const authorForBio = {
    name: article.author.name,
    slug: article.author.authorProfile?.slug ?? "",
    bio: article.author.authorProfile?.bio ?? null,
    avatarUrl: article.author.authorProfile?.avatarUrl ?? null,
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          ...(article.category
            ? [
                {
                  label: article.category.name,
                  href: `/category/${article.category.slug}`,
                },
              ]
            : []),
          { label: article.title },
        ]}
      />

      <header className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
        {article.category ? (
          <Badge variant="primary" className="w-fit">
            {article.category.name}
          </Badge>
        ) : null}
        <ArticleTitle>{article.title}</ArticleTitle>
        {article.excerpt ? (
          <BodyLarge className="text-foreground-secondary">
            {article.excerpt}
          </BodyLarge>
        ) : null}

        <div className="border-border flex flex-wrap items-center justify-between gap-4 border-y py-4">
          <AuthorBio author={authorForBio} />
          <div className="text-foreground-muted flex flex-col items-start gap-1 text-sm sm:items-end">
            {article.publishedAt ? (
              <time dateTime={article.publishedAt.toISOString()}>
                {formatDate(article.publishedAt)}
              </time>
            ) : null}
            <span>{readingTime} min read</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BookmarkButton
            articleId={article.id}
            articlePath={articlePath}
            initialBookmarked={initialBookmarked}
          />
          <ShareButton title={article.title} path={articlePath} />
        </div>
      </header>

      {article.featuredImage ? (
        <div className="bg-surface relative aspect-[16/9] w-full overflow-hidden rounded-lg">
          <Image
            src={article.featuredImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[1fr_240px] lg:items-start lg:gap-12">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-10">
          <TableOfContents headings={headings} className="lg:hidden" />

          <ArticleContent blocks={article.blocks} />

          {article.tags.length > 0 ? (
            <div className="border-border flex flex-wrap gap-2 border-t pt-6">
              {article.tags.map(({ tag }) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>
          ) : null}

          {authorForBio.slug ? (
            <div className="border-border bg-surface rounded-lg border p-5">
              <AuthorBio author={authorForBio} variant="full" />
            </div>
          ) : null}

          <section className="flex flex-col gap-4">
            <h2 className="text-foreground text-xl font-semibold">Comments</h2>
            <CommentsList comments={article.comments} />
          </section>
        </div>

        <aside className="hidden lg:sticky lg:top-20 lg:block">
          <TableOfContents headings={headings} />
        </aside>
      </div>

      {relatedArticles.length > 0 ? (
        <ArticleSection title="Related articles">
          {relatedArticles.map((related) => (
            <ArticleCard
              key={related.id}
              article={related}
              variant="vertical"
            />
          ))}
        </ArticleSection>
      ) : null}

      <NewsletterCta />
    </div>
  );
}
