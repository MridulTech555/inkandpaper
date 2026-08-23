export const PERMISSIONS = [
  "article:create",
  "article:read",
  "article:update",
  "article:delete",
  "article:publish",
  "article:review",

  "category:create",
  "category:update",
  "category:delete",

  "tag:create",
  "tag:update",
  "tag:delete",

  "comment:moderate",

  "user:create",
  "user:update",
  "user:delete",

  "author:create",
  "author:update",
  "author:manage",

  "analytics:view",

  "settings:manage",

  "role:manage",

  "audit:view",
] as const;

export type PermissionName = (typeof PERMISSIONS)[number];

export const ROLE_NAMES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "AUTHOR",
  "READER",
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export const ROLE_PERMISSIONS: Record<RoleName, readonly PermissionName[]> = {
  SUPER_ADMIN: PERMISSIONS,
  ADMIN: [
    "article:read",
    "article:update",
    "article:delete",
    "article:publish",
    "article:review",
    "category:create",
    "category:update",
    "category:delete",
    "tag:create",
    "tag:update",
    "tag:delete",
    "comment:moderate",
    "user:create",
    "user:update",
    "user:delete",
    "author:create",
    "author:update",
    "author:manage",
    "analytics:view",
    "audit:view",
  ],
  EDITOR: [
    "article:read",
    "article:update",
    "article:publish",
    "article:review",
    "category:update",
    "comment:moderate",
  ],
  AUTHOR: [
    "article:create",
    "article:read",
    "article:update",
    "article:delete",
    "author:update",
  ],
  READER: ["article:read"],
};
