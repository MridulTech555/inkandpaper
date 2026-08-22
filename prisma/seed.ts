import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROLE_NAMES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "AUTHOR",
  "READER",
] as const;

const PERMISSIONS = [
  "article:create",
  "article:edit",
  "article:delete",
  "article:publish",
  "article:review",
  "category:manage",
  "comment:moderate",
  "user:manage",
  "settings:manage",
] as const;

const ROLE_PERMISSIONS: Record<(typeof ROLE_NAMES)[number], readonly string[]> =
  {
    SUPER_ADMIN: PERMISSIONS,
    ADMIN: [
      "article:review",
      "category:manage",
      "comment:moderate",
      "user:manage",
      "settings:manage",
    ],
    EDITOR: [
      "article:edit",
      "article:review",
      "article:publish",
      "comment:moderate",
    ],
    AUTHOR: ["article:create", "article:edit"],
    READER: [],
  };

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

  for (const roleName of ROLE_NAMES) {
    const role = roleByName.get(roleName)!;
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

  const superAdminPasswordHash = await bcrypt.hash(
    seedPassword("SEED_SUPER_ADMIN_PASSWORD", "ChangeMe123!SuperAdmin"),
    12,
  );
  const authorPasswordHash = await bcrypt.hash(
    seedPassword("SEED_AUTHOR_PASSWORD", "ChangeMe123!Author"),
    12,
  );
  const readerPasswordHash = await bcrypt.hash(
    seedPassword("SEED_READER_PASSWORD", "ChangeMe123!Reader"),
    12,
  );

  await prisma.user.upsert({
    where: { email: "super.admin@inknpaper.dev" },
    update: {},
    create: {
      name: "Super Admin",
      email: "super.admin@inknpaper.dev",
      passwordHash: superAdminPasswordHash,
      roleId: roleByName.get("SUPER_ADMIN")!.id,
    },
  });

  const authorUser = await prisma.user.upsert({
    where: { email: "author@inknpaper.dev" },
    update: {},
    create: {
      name: "Ada Author",
      email: "author@inknpaper.dev",
      passwordHash: authorPasswordHash,
      roleId: roleByName.get("AUTHOR")!.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "reader@inknpaper.dev" },
    update: {},
    create: {
      name: "Riley Reader",
      email: "reader@inknpaper.dev",
      passwordHash: readerPasswordHash,
      roleId: roleByName.get("READER")!.id,
    },
  });

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
