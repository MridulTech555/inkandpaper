import { Prisma, PrismaClient } from "@prisma/client";
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

  const authorProfileData = {
    bio: "Writes about technology, culture, and everything in between. Formerly an engineer, now mostly found with a notebook and too many browser tabs open.",
    avatarUrl: "https://picsum.photos/seed/ada-author-avatar/256/256",
    socialLinks: {
      twitter: "https://twitter.com/adaauthor",
      website: "https://adaauthor.dev",
    },
  };

  await prisma.authorProfile.upsert({
    where: { userId: authorUser.id },
    update: authorProfileData,
    create: { userId: authorUser.id, slug: "ada-author", ...authorProfileData },
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
      publishedDaysAgo: 1,
      blocks: [
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "Every blogging platform starts with the same question: how much should the framework decide for you, and how much should stay open? Ink & Paper leans toward the App Router's defaults, and mostly, that has paid off.",
          },
        },
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "The foundation is deliberately boring: TypeScript in strict mode, Prisma against Postgres, and a component library built once and reused across the public site, the author dashboard, and the admin console. Boring, in this context, is a compliment.",
          },
        },
        {
          type: "HEADING" as const,
          content: { text: "Server Components as the default", level: 2 },
        },
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "Article pages, category pages, and search results are all rendered on the server, straight from the database, with no client-side fetching in the critical path. The only components that ship JavaScript are the ones that genuinely need interactivity: a bookmark toggle, a share button, a search filter.",
          },
        },
        {
          type: "QUOTE" as const,
          content: {
            text: "The best client component is the one you didn't have to write.",
          },
        },
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "That constraint shapes almost every decision downstream, from how data is fetched to how forms are submitted. It is easy to add interactivity later; it is much harder to claw it back once a page has already committed to being a client bundle.",
          },
        },
      ],
    },
    {
      title: "Why We Still Write Long-Form",
      slug: "why-we-still-write-long-form",
      excerpt:
        "In a world of short attention spans, long-form writing endures.",
      category: categories[1],
      tags: [tags[2]],
      publishedDaysAgo: 4,
      blocks: [
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "It would be easy to conclude that nobody reads anymore — that everything worth saying now fits in a headline, a caption, or a fifteen-second clip. And yet, somehow, the long essay refuses to die.",
          },
        },
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "Long-form writing survives because some ideas simply do not compress. A complicated argument needs room to build; a nuanced position needs space to acknowledge its own exceptions. Cut those away and what is left is not the idea, just its slogan.",
          },
        },
        {
          type: "HEADING" as const,
          content: { text: "Reading as a deliberate act", level: 2 },
        },
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "There is also something the reader gets from committing to a longer piece: the sense of having actually thought something through, rather than having merely been exposed to it. That difference is easy to underrate until you notice how rarely it happens.",
          },
        },
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "None of this is an argument against brevity where brevity is honest. It is an argument against mistaking brevity for depth, when what it usually offers is just less to disagree with.",
          },
        },
      ],
    },
    {
      title: "Notes from the Road",
      slug: "notes-from-the-road",
      excerpt: "Reflections from a few weeks of travel.",
      category: categories[2],
      tags: [tags[1], tags[2]],
      publishedDaysAgo: 9,
      blocks: [
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "Three weeks, four cities, and one suitcase that was, in retrospect, always going to be too small. Travel has a way of reorganizing your sense of what actually matters, usually somewhere around the second missed train.",
          },
        },
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "The itinerary planned for a lot of movement and very little rest, which in hindsight was the wrong trade to make. The best mornings were the unplanned ones — the ones spent finding a bakery by smell rather than by search.",
          },
        },
        {
          type: "HEADING" as const,
          content: {
            text: "What actually made it into the notebook",
            level: 2,
          },
        },
        {
          type: "PARAGRAPH" as const,
          content: {
            text: "Not the museums, mostly. What stuck were smaller things: a stranger's directions that turned into a forty-minute conversation, a menu with no English and no regrets, the particular quiet of a city before its shops open.",
          },
        },
        {
          type: "QUOTE" as const,
          content: {
            text: "You don't remember the itinerary. You remember the detour.",
          },
        },
      ],
    },
  ];

  for (const article of articleData) {
    const publishedAt = new Date(
      Date.now() - article.publishedDaysAgo * 24 * 60 * 60 * 1000,
    );

    const articleScalarData = {
      title: article.title,
      excerpt: article.excerpt,
      featuredImage: `https://picsum.photos/seed/${article.slug}/1600/900`,
      status: "PUBLISHED" as const,
      authorId: authorUser.id,
      categoryId: article.category.id,
      publishedAt,
      createdAt: publishedAt,
    };

    const created = await prisma.article.upsert({
      where: { slug: article.slug },
      update: articleScalarData,
      create: { slug: article.slug, ...articleScalarData },
    });

    // Blocks are a fully-owned child list: replace them wholesale on every
    // run so edits to the copy above always show up, instead of only
    // applying the first time the article is created.
    await prisma.articleBlock.deleteMany({ where: { articleId: created.id } });
    await prisma.articleBlock.createMany({
      data: article.blocks.map((block, index) => ({
        articleId: created.id,
        type: block.type,
        position: index,
        content: block.content,
      })),
    });

    for (const tag of article.tags) {
      await prisma.articleTag.upsert({
        where: { articleId_tagId: { articleId: created.id, tagId: tag.id } },
        update: {},
        create: { articleId: created.id, tagId: tag.id },
      });
    }

    const reader = usersByRole.get("READER")!;
    const commentContent = `Really enjoyed "${article.title}" — looking forward to more like this.`;
    await prisma.comment.upsert({
      where: { id: `seed-comment-${created.id}` },
      update: { content: commentContent },
      create: {
        id: `seed-comment-${created.id}`,
        articleId: created.id,
        userId: reader.id,
        content: commentContent,
        status: "VISIBLE",
      },
    });
  }

  const reader = usersByRole.get("READER")!;

  // A reader asking for author access, and a comment flagged for moderation —
  // both feed the admin dashboard's "Needs attention" panel with real rows
  // instead of always showing zero until the app has real traffic.
  await prisma.authorRequest.upsert({
    where: { id: "seed-author-request-riley" },
    update: {},
    create: {
      id: "seed-author-request-riley",
      userId: reader.id,
      message:
        "I've been writing for a few years and would love to contribute.",
      status: "PENDING",
    },
  });

  const firstArticle = await prisma.article.findUnique({
    where: { slug: articleData[0].slug },
    select: { id: true },
  });
  if (firstArticle) {
    await prisma.comment.upsert({
      where: { id: "seed-comment-reported" },
      update: { status: "REPORTED" },
      create: {
        id: "seed-comment-reported",
        articleId: firstArticle.id,
        userId: reader.id,
        content: "This link looks suspicious, please review.",
        status: "REPORTED",
      },
    });
  }

  // An overdue scheduled article — surfaces in "Needs attention" as a
  // failed-publish signal (a scheduled time that has already passed).
  const overdueScheduledData = {
    title: "The Overdue Draft",
    excerpt: "This one missed its publish window.",
    status: "SCHEDULED" as const,
    authorId: authorUser.id,
    categoryId: categories[0].id,
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  };
  await prisma.article.upsert({
    where: { slug: "the-overdue-draft" },
    update: overdueScheduledData,
    create: { slug: "the-overdue-draft", ...overdueScheduledData },
  });

  // An article awaiting editorial review — feeds the review queue.
  const inReviewData = {
    title: "First Impressions of the New Editor",
    excerpt: "A quick look at the new writing tools.",
    status: "IN_REVIEW" as const,
    authorId: authorUser.id,
    categoryId: categories[0].id,
  };
  const inReviewArticle = await prisma.article.upsert({
    where: { slug: "first-impressions-of-the-new-editor" },
    update: inReviewData,
    create: { slug: "first-impressions-of-the-new-editor", ...inReviewData },
  });
  await prisma.articleBlock.deleteMany({
    where: { articleId: inReviewArticle.id },
  });
  await prisma.articleBlock.create({
    data: {
      articleId: inReviewArticle.id,
      type: "PARAGRAPH",
      position: 0,
      content: {
        text: "The new block editor makes it much easier to compose a mix of text, images, and callouts without leaving the writing flow.",
      },
    },
  });

  // Default site settings — one row per admin settings section.
  const defaultSettings: Record<string, Record<string, unknown>> = {
    general: {
      siteName: "Ink & Paper",
      tagline: "Stories worth staying up for.",
      supportEmail: "hello@inknpaper.dev",
      timezone: "UTC",
    },
    branding: {
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#111111",
      accentColor: "#6366f1",
    },
    seo: {
      defaultMetaTitle: "Ink & Paper",
      defaultMetaDescription: "A modern blogging platform.",
      defaultOgImage: "",
      twitterHandle: "",
    },
    notifications: {
      notifyOnNewComment: true,
      notifyOnReviewSubmitted: true,
      notifyOnAuthorRequest: true,
      digestFrequency: "daily",
    },
    security: {
      requireTwoFactorForAdmins: false,
      sessionDurationDays: "30",
      allowPublicRegistration: true,
    },
    integrations: {
      googleAnalyticsId: "",
      slackWebhookUrl: "",
      mailProvider: "none",
    },
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as Prisma.InputJsonValue },
    });
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
