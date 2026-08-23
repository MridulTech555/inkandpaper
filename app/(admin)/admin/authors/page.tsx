import Link from "next/link";
import { Users } from "lucide-react";
import { getAdminAuthors } from "@/lib/services/admin-authors";
import { H1 } from "@/components/ui/typography";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { AdminAuthorListItem } from "@/lib/services/admin-authors";

function formatDate(date: Date | null): string {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function AdminAuthorsPage() {
  const authors = await getAdminAuthors();

  const columns: DataTableColumn<AdminAuthorListItem>[] = [
    {
      key: "name",
      header: "Name",
      render: (author) => (
        <Link
          href={`/admin/authors/${author.id}`}
          className="flex items-center gap-3"
        >
          <Avatar
            size="sm"
            fallback={author.name.charAt(0)}
            src={author.avatarUrl ?? undefined}
          />
          <span className="text-foreground hover:text-primary font-medium">
            {author.name}
          </span>
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (author) => (
        <Badge variant={author.status === "ACTIVE" ? "success" : "outline"}>
          {author.status}
        </Badge>
      ),
    },
    { key: "articleCount", header: "Articles" },
    {
      key: "lastActiveAt",
      header: "Last active",
      render: (author) => formatDate(author.lastActiveAt),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Authors</H1>

      {authors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No authors yet"
          description="Promote a reader to author from Users, or approve an author request."
        />
      ) : (
        <DataTable
          columns={columns}
          data={authors}
          getRowId={(author) => author.id}
        />
      )}
    </div>
  );
}
