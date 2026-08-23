import { hasPermission, requireUser } from "@/lib/permissions/check";
import { getRolesWithPermissions } from "@/lib/services/admin-roles";
import { prisma } from "@/lib/db/prisma";
import { H1 } from "@/components/ui/typography";
import { Alert } from "@/components/ui/alert";
import { RolePermissionMatrix } from "@/components/admin/role-permission-matrix";

export default async function AdminRolesPage() {
  const user = await requireUser();
  const canManage = hasPermission(user, "role:manage");

  const [roles, permissions] = await Promise.all([
    getRolesWithPermissions(),
    prisma.permission.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <H1 className="text-2xl">Roles &amp; permissions</H1>
        <p className="text-foreground-secondary text-sm">
          What each role can do across the platform.
        </p>
      </div>

      {!canManage ? (
        <Alert title="Read-only">
          Only Super Admin can change role permissions.
        </Alert>
      ) : null}

      <RolePermissionMatrix
        roles={roles}
        permissions={permissions}
        canManage={canManage}
      />
    </div>
  );
}
