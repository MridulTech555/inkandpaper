"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/permissions/check";
import { logAudit } from "@/lib/services/audit-log";
import { categoryFormSchema } from "@/lib/validation/taxonomy";

export interface CategoryActionResult {
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
  let candidate = base || "category";
  let suffix = 2;
  while (
    await prisma.category.findFirst({
      where: { slug: candidate, id: { not: excludeId } },
      select: { id: true },
    })
  ) {
    candidate = `${base || "category"}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function createCategoryAction(payload: {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
}): Promise<CategoryActionResult> {
  const admin = await requirePermission("category:create");

  const parsed = categoryFormSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category." };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(slugify(data.slug || data.name));

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
    },
  });

  await logAudit({
    userId: admin.id,
    action: "category.created",
    entity: "Category",
    entityId: category.id,
  });

  revalidatePath("/admin/categories");
  return {};
}

export async function updateCategoryAction(
  categoryId: string,
  payload: {
    name: string;
    slug?: string;
    description?: string;
    image?: string;
  },
): Promise<CategoryActionResult> {
  const admin = await requirePermission("category:update");

  const parsed = categoryFormSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category." };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(slugify(data.slug || data.name), categoryId);

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
    },
  });

  await logAudit({
    userId: admin.id,
    action: "category.updated",
    entity: "Category",
    entityId: categoryId,
  });

  revalidatePath("/admin/categories");
  return {};
}

export async function deleteCategoryAction(
  categoryId: string,
): Promise<CategoryActionResult> {
  const admin = await requirePermission("category:delete");

  await prisma.category.delete({ where: { id: categoryId } });

  await logAudit({
    userId: admin.id,
    action: "category.deleted",
    entity: "Category",
    entityId: categoryId,
  });

  revalidatePath("/admin/categories");
  return {};
}
