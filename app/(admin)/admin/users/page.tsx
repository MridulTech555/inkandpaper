import { UsersRound } from "lucide-react";
import { requireUser } from "@/lib/permissions/check";
import { getAdminUsers, getAllRoles } from "@/lib/services/admin-users";
import { H1 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { UserRowActions } from "@/components/admin/user-row-actions";
import type { AdminUserListItem } from "@/lib/services/admin-users";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const STATUS_VARIANT = {
  ACTIVE: "success",
  INACTIVE: "outline",
  SUSPENDED: "error",
} as const;

interface AdminUsersPageProps {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const currentUser = await requireUser();
  const { q, role, status } = await searchParams;

  const validStatus =
    status === "ACTIVE" || status === "INACTIVE" || status === "SUSPENDED"
      ? status
      : undefined;

  const [users, roles] = await Promise.all([
    getAdminUsers({ search: q, roleId: role, status: validStatus }),
    getAllRoles(),
  ]);

  const columns: DataTableColumn<AdminUserListItem>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (user) => <Badge variant="outline">{user.role.name}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <Badge variant={STATUS_VARIANT[user.status]}>{user.status}</Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (user) => formatDate(user.createdAt),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (user) => (
        <div className="flex justify-end">
          <UserRowActions
            userId={user.id}
            currentRoleId={user.role.id}
            status={user.status}
            roles={roles}
            isSelf={user.id === currentUser.id}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Users</H1>

      <form
        method="GET"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="text-foreground text-sm font-medium">
            Search
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Name or email…"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="role" className="text-foreground text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue={role ?? ""}
            className="border-border text-foreground focus-visible:ring-primary h-10 rounded-md border bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="">All roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="status"
            className="text-foreground text-sm font-medium"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="border-border text-foreground focus-visible:ring-primary h-10 rounded-md border bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
        <Button type="submit">Filter</Button>
      </form>

      {users.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No users found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          getRowId={(user) => user.id}
        />
      )}
    </div>
  );
}
