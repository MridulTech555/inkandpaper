"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/permissions/check";
import { logAudit } from "@/lib/services/audit-log";
import { tagFormSchema } from "@/lib/validation/taxonomy";

export interface TagActionResult {
  error?: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base || "tag";
  let suffix = 2;
  while (
    await prisma.tag.findFirst({
      where: { slug: candidate, id: { not: excludeId } },
      select: { id: true },
    })
  ) {
    candidate = `${base || "tag"}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createTagAction(payload: {
  name: string;
  slug?: string;
}): Promise<TagActionResult> {
  const admin = await requirePermission("tag:create");

  const parsed = tagFormSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid tag." };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(slugify(data.slug || data.name));

  const tag = await prisma.tag.create({ data: { name: data.name, slug } });

  await logAudit({
    userId: admin.id,
    action: "tag.created",
    entity: "Tag",
    entityId: tag.id,
  });

  revalidatePath("/admin/tags");
  return {};
}

export async function updateTagAction(
  tagId: string,
  payload: { name: string; slug?: string },
): Promise<TagActionResult> {
  const admin = await requirePermission("tag:update");

  const parsed = tagFormSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid tag." };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(slugify(data.slug || data.name), tagId);

  await prisma.tag.update({
    where: { id: tagId },
    data: { name: data.name, slug },
  });

  await logAudit({
    userId: admin.id,
    action: "tag.updated",
    entity: "Tag",
    entityId: tagId,
  });

  revalidatePath("/admin/tags");
  return {};
}

export async function deleteTagAction(tagId: string): Promise<TagActionResult> {
  const admin = await requirePermission("tag:delete");

  await prisma.tag.delete({ where: { id: tagId } });

  await logAudit({
    userId: admin.id,
    action: "tag.deleted",
    entity: "Tag",
    entityId: tagId,
  });

  revalidatePath("/admin/tags");
  return {};
}
