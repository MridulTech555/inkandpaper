import { RoutePlaceholder } from "@/components/shared/route-placeholder";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  return (
    <RoutePlaceholder
      title="Article"
      description={`Placeholder for article: ${slug}`}
    />
  );
}
