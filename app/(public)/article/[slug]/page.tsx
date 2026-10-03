import type { Metadata } from "next";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { notFound } from "next/navigation";
import { after } from "next/server";
import {
  computeReadingTime,
  extractHeadings,
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/services/articles";
import { recordArticleView } from "@/lib/services/article-views";
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
import { CommentForm } from "@/components/blog/comment-form";
import { AuthorBio } from "@/components/blog/author-bio";
import { BookmarkButton } from "@/components/blog/bookmark-button";
import { LikeButton } from "@/components/blog/like-button";
import { ShareButton } from "@/components/blog/share-button";
import { NewsletterCta } from "@/components/blog/newsletter-cta";
import { JsonLd } from "@/components/seo/json-ld";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

interface ArticleSeo {
  metaTitle?: unknown;
  metaDescription?: unknown;
  ogImage?: unknown;
  canonicalUrl?: unknown;
}

function seoString(
  seo: ArticleSeo | null,
  key: keyof ArticleSeo,
): string | undefined {
  const value = seo?.[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const seo = article.seo as ArticleSeo | null;
  const title = seoString(seo, "metaTitle") ?? article.title;
  const description =
    seoString(seo, "metaDescription") ?? article.excerpt ?? undefined;
  const image = seoString(seo, "ogImage") ?? article.featuredImage ?? undefined;
  const canonicalUrl = seoString(seo, "canonicalUrl");

  return {
    title,
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name],
      images: image ? [{ url: image }] : undefined,
      url: `${siteConfig.url}/article/${article.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
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

  const [initialBookmarked, initialLiked] = await Promise.all([
    currentUser
      ? prisma.bookmark
          .findUnique({
            where: {
              userId_articleId: {
                userId: currentUser.id,
                articleId: article.id,
              },
            },
            select: { id: true },
          })
          .then(Boolean)
      : false,
    currentUser
      ? prisma.like
          .findUnique({
            where: {
              userId_articleId: {
                userId: currentUser.id,
                articleId: article.id,
              },
            },
            select: { id: true },
          })
          .then(Boolean)
      : false,
  ]);

  // Recorded after the response is sent so it never adds latency to the
  // page. Authors viewing their own article don't inflate their own count.
  if (currentUser?.id !== article.author.id) {
    after(() => recordArticleView(article.id, currentUser?.id ?? null));
  }

  const readingTime = computeReadingTime(article.blocks);
  const headings = extractHeadings(article.blocks);
  const articlePath = `/article/${article.slug}`;

  const authorForBio = {
    name: article.author.name,
    slug: article.author.authorProfile?.slug ?? "",
    bio: article.author.authorProfile?.bio ?? null,
    avatarUrl: article.author.authorProfile?.avatarUrl ?? null,
  };

  const articleJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.featuredImage ?? undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: `${siteConfig.url}${articlePath}`,
    author: authorForBio.slug
      ? {
          "@type": "Person",
          name: authorForBio.name,
          url: `${siteConfig.url}/author/${authorForBio.slug}`,
        }
      : { "@type": "Person", name: authorForBio.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  const breadcrumbJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Home", url: siteConfig.url },
      ...(article.category
        ? [
            {
              name: article.category.name,
              url: `${siteConfig.url}/category/${article.category.slug}`,
            },
          ]
        : []),
      { name: article.title, url: `${siteConfig.url}${articlePath}` },
    ].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {authorForBio.slug ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: authorForBio.name,
            description: authorForBio.bio ?? undefined,
            image: authorForBio.avatarUrl ?? undefined,
            url: `${siteConfig.url}/author/${authorForBio.slug}`,
          }}
        />
      ) : null}

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
          <LikeButton
            articleId={article.id}
            articlePath={articlePath}
            initialLiked={initialLiked}
            initialCount={article._count.likes}
          />
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
          <ImageWithFallback
            src={article.featuredImage}
            alt={article.title}
            fill
            priority
            unoptimized
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
            <CommentForm
              articleId={article.id}
              articlePath={articlePath}
              currentUser={currentUser}
            />
            <CommentsList
              comments={article.comments}
              articlePath={articlePath}
              currentUserId={currentUser?.id ?? null}
            />
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
