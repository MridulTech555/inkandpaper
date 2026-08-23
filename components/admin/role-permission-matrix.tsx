"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "@/hooks/use-toast";
import { toggleRolePermissionAction } from "@/lib/services/role-actions";
import { groupPermissionsByCategory } from "@/lib/utils/permission-grouping";
import type { RoleWithPermissions } from "@/lib/services/admin-roles";

export function RolePermissionMatrix({
  roles,
  permissions,
  canManage,
}: {
  roles: RoleWithPermissions[];
  permissions: { id: string; name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const permissionById = new Map(permissions.map((p) => [p.name, p.id]));
  const groups = groupPermissionsByCategory(permissions.map((p) => p.name));

  function handleToggle(role: RoleWithPermissions, permissionName: string) {
    if (!canManage || role.name === "SUPER_ADMIN") return;
    const permissionId = permissionById.get(permissionName);
    if (!permissionId) return;

    const grant = !role.permissionNames.has(permissionName);
    const key = `${role.id}:${permissionName}`;
    setPendingKey(key);
    startTransition(async () => {
      const result = await toggleRolePermissionAction(
        role.id,
        permissionId,
        grant,
      );
      if (result.error) {
        toast({
          title: "Couldn't update permission",
          description: result.error,
          variant: "error",
        });
      }
      setPendingKey(null);
      router.refresh();
    });
  }

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border bg-surface border-b text-left">
            <th className="text-foreground-secondary px-4 py-3 text-xs font-medium tracking-wide uppercase">
              Permission
            </th>
            {roles.map((role) => (
              <th
                key={role.id}
                className="text-foreground-secondary px-4 py-3 text-center text-xs font-medium tracking-wide uppercase"
              >
                {role.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.category}>
              <tr className="bg-surface/50">
                <td
                  colSpan={roles.length + 1}
                  className="text-foreground-muted px-4 py-2 text-xs font-semibold tracking-wide uppercase"
                >
                  {group.category}
                </td>
              </tr>
              {group.permissions.map((permissionName) => (
                <tr
                  key={permissionName}
                  className="border-border border-b last:border-0"
                >
                  <td className="text-foreground px-4 py-2.5">
                    {permissionName}
                  </td>
                  {roles.map((role) => {
                    const granted = role.permissionNames.has(permissionName);
                    const key = `${role.id}:${permissionName}`;
                    const disabled =
                      !canManage || role.name === "SUPER_ADMIN" || isPending;
                    return (
                      <td key={role.id} className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleToggle(role, permissionName)}
                          aria-label={`${granted ? "Revoke" : "Grant"} ${permissionName} for ${role.name}`}
                          aria-pressed={granted}
                          className={cn(
                            "border-border mx-auto flex h-5 w-5 items-center justify-center rounded border transition-colors",
                            granted
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-transparent",
                            disabled
                              ? "cursor-not-allowed opacity-50"
                              : "hover:border-primary cursor-pointer",
                            pendingKey === key && "animate-pulse",
                          )}
                        >
                          {granted ? <Check className="h-3.5 w-3.5" /> : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
