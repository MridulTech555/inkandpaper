import { Plus, FolderTree } from "lucide-react";
import { getAdminCategories } from "@/lib/services/admin-categories";
import { H1 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { AdminCategoryTable } from "@/components/admin/admin-category-table";

interface AdminCategoriesPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const { q } = await searchParams;
  const categories = await getAdminCategories(q);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <H1 className="text-2xl">Categories</H1>
        <CategoryFormDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              New category
            </Button>
          }
        />
      </div>

      <form method="GET" className="flex max-w-sm gap-2">
        <Input name="q" defaultValue={q} placeholder="Search categories…" />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories"
          description="Create a category to start organizing articles."
        />
      ) : (
        <AdminCategoryTable categories={categories} />
      )}
    </div>
  );
}
