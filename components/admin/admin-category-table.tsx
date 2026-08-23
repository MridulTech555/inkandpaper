import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { deleteCategoryAction } from "@/lib/services/category-actions";
import type { AdminCategoryListItem } from "@/lib/services/admin-categories";

export function AdminCategoryTable({
  categories,
}: {
  categories: AdminCategoryListItem[];
}) {
  const columns: DataTableColumn<AdminCategoryListItem>[] = [
    { key: "name", header: "Name" },
    { key: "slug", header: "Slug" },
    {
      key: "articles",
      header: "Articles",
      render: (category) => category._count.articles,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (category) => (
        <div className="flex justify-end gap-1">
          <CategoryFormDialog
            category={category}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Edit category">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <DeleteEntityButton
            id={category.id}
            title="Delete this category?"
            description={
              category._count.articles > 0
                ? `${category._count.articles} article(s) will be uncategorized. This can't be undone.`
                : "This can't be undone."
            }
            successMessage="Category deleted"
            action={deleteCategoryAction}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={categories}
      getRowId={(category) => category.id}
    />
  );
}
