import { Plus, Pencil, Tags as TagsIcon } from "lucide-react";
import { getAdminTags } from "@/lib/services/admin-tags";
import { deleteTagAction } from "@/lib/services/tag-actions";
import { H1 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { TagFormDialog } from "@/components/admin/tag-form-dialog";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import type { AdminTagListItem } from "@/lib/services/admin-tags";

interface AdminTagsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminTagsPage({
  searchParams,
}: AdminTagsPageProps) {
  const { q } = await searchParams;
  const tags = await getAdminTags(q);

  const columns: DataTableColumn<AdminTagListItem>[] = [
    { key: "name", header: "Name" },
    { key: "slug", header: "Slug" },
    {
      key: "articles",
      header: "Articles",
      render: (tag) => tag._count.articles,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (tag) => (
        <div className="flex justify-end gap-1">
          <TagFormDialog
            tag={tag}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Edit tag">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <DeleteEntityButton
            id={tag.id}
            title="Delete this tag?"
            description={
              tag._count.articles > 0
                ? `It will be removed from ${tag._count.articles} article(s). This can't be undone.`
                : "This can't be undone."
            }
            successMessage="Tag deleted"
            action={deleteTagAction}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <H1 className="text-2xl">Tags</H1>
        <TagFormDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4" />
              New tag
            </Button>
          }
        />
      </div>

      <form method="GET" className="flex max-w-sm gap-2">
        <Input name="q" defaultValue={q} placeholder="Search tags…" />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {tags.length === 0 ? (
        <EmptyState
          icon={TagsIcon}
          title="No tags"
          description="Create a tag to help readers find related content."
        />
      ) : (
        <DataTable columns={columns} data={tags} getRowId={(tag) => tag.id} />
      )}
    </div>
  );
}
