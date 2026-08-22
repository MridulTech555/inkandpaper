import { RoutePlaceholder } from "@/components/shared/route-placeholder";

interface AuthorProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function AuthorProfilePage({
  params,
}: AuthorProfilePageProps) {
  const { slug } = await params;

  return (
    <RoutePlaceholder
      title="Author"
      description={`Placeholder for public author profile: ${slug}`}
    />
  );
}
