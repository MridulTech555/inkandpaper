import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedArticleForPreview } from "@/lib/services/author-articles";
import { computeReadingTime, extractHeadings } from "@/lib/services/articles";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArticleTitle, BodyLarge } from "@/components/ui/typography";
import { ArticleContent } from "@/components/blog/article-content";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { AuthorBio } from "@/components/blog/author-bio";
import { ArticleStatusBadge } from "@/components/author/article-status-badge";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticlePreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const article = await getOwnedArticleForPreview(id, user!.id);
  if (!article) notFound();

  const readingTime = computeReadingTime(article.blocks);
  const headings = extractHeadings(article.blocks);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Alert title="Preview">
        This is how &quot;{article.title}&quot; will look to readers.{" "}
        <Link
          href={`/author/articles/${article.id}/edit`}
          className="underline"
        >
          Back to editor
        </Link>
      </Alert>

      <header className="mx-auto flex w-full max-w-[720px] flex-col gap-4">
        <div className="flex items-center gap-2">
          {article.category ? (
            <Badge variant="primary">{article.category.name}</Badge>
          ) : null}
          <ArticleStatusBadge status={article.status} />
        </div>
        <ArticleTitle>{article.title}</ArticleTitle>
        {article.excerpt ? (
          <BodyLarge className="text-foreground-secondary">
            {article.excerpt}
          </BodyLarge>
        ) : null}
        <div className="border-border flex items-center justify-between border-y py-4">
          <AuthorBio
            author={{
              name: article.author.name,
              slug: article.author.authorProfile?.slug ?? "",
              bio: article.author.authorProfile?.bio ?? null,
              avatarUrl: article.author.authorProfile?.avatarUrl ?? null,
            }}
          />
          <span className="text-foreground-muted text-sm">
            {readingTime} min read
          </span>
        </div>
      </header>

      {article.featuredImage ? (
        <div className="bg-surface relative aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-lg">
          <Image
            src={article.featuredImage}
            alt=""
            fill
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
        </div>
        <aside className="hidden lg:sticky lg:top-20 lg:block">
          <TableOfContents headings={headings} />
        </aside>
      </div>
    </div>
  );
}
