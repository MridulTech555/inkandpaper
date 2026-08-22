import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByAuthor } from "@/lib/services/articles";
import { getAuthorProfileBySlug } from "@/lib/services/authors";
import { siteConfig } from "@/config/site";
import { AuthorBio } from "@/components/blog/author-bio";
import { ArticleCard } from "@/components/blog/article-card";
import { ArticleSection } from "@/components/blog/article-section";
import { ResultsPagination } from "@/components/blog/results-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

export const revalidate = 60;

const PAGE_SIZE = 9;

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getAuthorProfileBySlug(slug);
  if (!profile) return {};

  return {
    title: profile.user.name,
    description: profile.bio ?? `Articles by ${profile.user.name}`,
    openGraph: {
      title: profile.user.name,
      description: profile.bio ?? undefined,
      url: `${siteConfig.url}/author/${profile.slug}`,
    },
  };
}

export default async function AuthorProfilePage({
  params,
  searchParams,
}: AuthorPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const profile = await getAuthorProfileBySlug(slug);
  if (!profile) notFound();

  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [articles, total] = await getArticlesByAuthor(
    profile.user.id,
    skip,
    PAGE_SIZE,
  );
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="border-border border-b pb-8">
        <AuthorBio
          author={{
            name: profile.user.name,
            slug: profile.slug,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            socialLinks: profile.socialLinks,
          }}
          variant="full"
        />
      </header>

      {articles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No published articles yet"
          description={`${profile.user.name} hasn't published anything yet.`}
        />
      ) : (
        <>
          <ArticleSection title={`Articles by ${profile.user.name}`}>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="vertical"
              />
            ))}
          </ArticleSection>

          <ResultsPagination page={page} pageCount={pageCount} />
        </>
      )}
    </div>
  );
}
