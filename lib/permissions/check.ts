import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";
import type { PermissionName, RoleName } from "./permissions";

export function hasPermission(
  user: SessionUser | null,
  permission: PermissionName,
): boolean {
  return user !== null && user.permissions.includes(permission);
}

export function hasRole(
  user: SessionUser | null,
  ...roles: RoleName[]
): boolean {
  return user !== null && roles.includes(user.role.name);
}

/**
 * SUPER_ADMIN, ADMIN, and EDITOR can act on any author's articles (edit,
 * preview, archive, delete, submit) from the admin console — AUTHOR remains
 * scoped to their own work everywhere else.
 */
export function isManagerRole(user: SessionUser | null): boolean {
  return hasRole(user, "SUPER_ADMIN", "ADMIN", "EDITOR");
}

/** Redirects to /auth/login if there is no authenticated user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return user;
}

/** Redirects to /auth/login if unauthenticated, /unauthorized if the permission is missing. */
export async function requirePermission(
  permission: PermissionName,
): Promise<SessionUser> {
  const user = await requireUser();
  if (!hasPermission(user, permission)) redirect("/unauthorized");
  return user;
}

/** Redirects to /auth/login if unauthenticated, /unauthorized if the role doesn't match. */
export async function requireRole(...roles: RoleName[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!hasRole(user, ...roles)) redirect("/unauthorized");
  return user;
}
