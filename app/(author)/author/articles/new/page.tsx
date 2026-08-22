import { requirePermission } from "@/lib/permissions/check";
import { RoutePlaceholder } from "@/components/shared/route-placeholder";

export default async function NewArticlePage() {
  await requirePermission("article:create");

  return (
    <RoutePlaceholder
      title="New article"
      description="The article editor is not implemented yet."
    />
  );
}
