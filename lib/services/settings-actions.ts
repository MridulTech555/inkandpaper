"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/permissions/check";
import { logAudit } from "@/lib/services/audit-log";
import {
  settingsValueSchema,
  type SettingsSection,
} from "@/lib/validation/settings";

export interface SettingsActionResult {
  error?: string;
}

export async function updateSettingAction(
  section: SettingsSection,
  value: Record<string, unknown>,
): Promise<SettingsActionResult> {
  const admin = await requirePermission("settings:manage");

  const parsed = settingsValueSchema.safeParse(value);
  if (!parsed.success) {
    return { error: "Some fields aren't valid. Check and try again." };
  }

  await prisma.setting.upsert({
    where: { key: section },
    update: { value: parsed.data as Prisma.InputJsonValue },
    create: { key: section, value: parsed.data as Prisma.InputJsonValue },
  });

  await logAudit({
    userId: admin.id,
    action: "settings.updated",
    entity: "Setting",
    entityId: section,
  });

  revalidatePath(`/admin/settings/${section}`);
  return {};
}
