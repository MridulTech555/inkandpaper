import { RoutePlaceholder } from "@/components/shared/route-placeholder";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  return (
    <RoutePlaceholder
      title="Category"
      description={`Placeholder for category: ${slug}`}
    />
  );
}
