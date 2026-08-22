import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  PERMISSIONS,
  ROLE_NAMES,
  ROLE_PERMISSIONS,
} from "../lib/permissions/permissions";

const prisma = new PrismaClient();

function seedPassword(envVar: string, fallback: string): string {
  const value = process.env[envVar];
  if (!value) {
    console.warn(`${envVar} not set, using development fallback password.`);
  }
  return value ?? fallback;
}

async function main() {
  const roles = await Promise.all(
    ROLE_NAMES.map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
  const roleByName = new Map(roles.map((role) => [role.name, role]));

  const permissions = await Promise.all(
    PERMISSIONS.map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
  const permissionByName = new Map(
    permissions.map((permission) => [permission.name, permission]),
  );

  // Permission and RolePermission are kept in sync with lib/permissions/permissions.ts
  // on every run: drop anything no longer in that source of truth, then ensure
  // everything in it exists. Deleting a stale Permission cascades to its
  // RolePermission rows, so role grants never drift from the matrix.
  await prisma.permission.deleteMany({
    where: { name: { notIn: [...PERMISSIONS] } },
  });

  for (const roleName of ROLE_NAMES) {
    const role = roleByName.get(roleName)!;
    const allowedPermissionIds = ROLE_PERMISSIONS[roleName].map(
      (name) => permissionByName.get(name)!.id,
    );

    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id, permissionId: { notIn: allowedPermissionIds } },
    });

    for (const permissionName of ROLE_PERMISSIONS[roleName]) {
      const permission = permissionByName.get(permissionName)!;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permission.id },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  const demoUsers = [
    {
      envVar: "SEED_SUPER_ADMIN_PASSWORD",
      fallback: "ChangeMe123!SuperAdmin",
      name: "Super Admin",
      email: "super.admin@inknpaper.dev",
      role: "SUPER_ADMIN" as const,
    },
    {
      envVar: "SEED_ADMIN_PASSWORD",
      fallback: "ChangeMe123!Admin",
      name: "Ann Admin",
      email: "admin@inknpaper.dev",
      role: "ADMIN" as const,
    },
    {
      envVar: "SEED_EDITOR_PASSWORD",
      fallback: "ChangeMe123!Editor",
      name: "Eli Editor",
      email: "editor@inknpaper.dev",
      role: "EDITOR" as const,
    },
    {
      envVar: "SEED_AUTHOR_PASSWORD",
      fallback: "ChangeMe123!Author",
      name: "Ada Author",
      email: "author@inknpaper.dev",
      role: "AUTHOR" as const,
    },
    {
      envVar: "SEED_READER_PASSWORD",
      fallback: "ChangeMe123!Reader",
      name: "Riley Reader",
      email: "reader@inknpaper.dev",
      role: "READER" as const,
    },
  ];

  const usersByRole = new Map<string, { id: string }>();
  for (const demoUser of demoUsers) {
    const passwordHash = await bcrypt.hash(
      seedPassword(demoUser.envVar, demoUser.fallback),
      12,
    );
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {},
      create: {
        name: demoUser.name,
        email: demoUser.email,
        passwordHash,
        roleId: roleByName.get(demoUser.role)!.id,
      },
    });
    usersByRole.set(demoUser.role, user);
  }

  const authorUser = usersByRole.get("AUTHOR")!;

  await prisma.authorProfile.upsert({
    where: { userId: authorUser.id },
    update: {},
    create: {
      userId: authorUser.id,
      slug: "ada-author",
      bio: "Writes about technology, culture, and everything in between.",
    },
  });

  const categoryData = [
    {
      name: "Technology",
      slug: "technology",
      description: "Software, hardware, and the web.",
    },
    {
      name: "Culture",
      slug: "culture",
      description: "Ideas, media, and society.",
    },
    {
      name: "Travel",
      slug: "travel",
      description: "Places worth writing home about.",
    },
  ];
  const categories = await Promise.all(
    categoryData.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      }),
    ),
  );

  const tagData = [
    { name: "Next.js", slug: "nextjs" },
    { name: "Design", slug: "design" },
    { name: "Opinion", slug: "opinion" },
  ];
  const tags = await Promise.all(
    tagData.map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      }),
    ),
  );

  const articleData = [
    {
      title: "Building a Blogging Platform with Next.js",
      slug: "building-a-blogging-platform-with-nextjs",
      excerpt: "A look at the architecture decisions behind Ink & Paper.",
      category: categories[0],
      tags: [tags[0], tags[1]],
    },
    {
      title: "Why We Still Write Long-Form",
      slug: "why-we-still-write-long-form",
      excerpt:
        "In a world of short attention spans, long-form writing endures.",
      category: categories[1],
      tags: [tags[2]],
    },
    {
      title: "Notes from the Road",
      slug: "notes-from-the-road",
      excerpt: "Reflections from a few weeks of travel.",
      category: categories[2],
      tags: [tags[1], tags[2]],
    },
  ];

  for (const article of articleData) {
    const created = await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        status: "PUBLISHED",
        authorId: authorUser.id,
        categoryId: article.category.id,
        publishedAt: new Date(),
        blocks: {
          create: [
            {
              type: "HEADING",
              position: 0,
              content: { text: article.title, level: 1 },
            },
            {
              type: "PARAGRAPH",
              position: 1,
              content: { text: article.excerpt },
            },
          ],
        },
      },
    });

    for (const tag of article.tags) {
      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId: created.id, tagId: tag.id } },
        update: {},
        create: { articleId: created.id, tagId: tag.id },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
