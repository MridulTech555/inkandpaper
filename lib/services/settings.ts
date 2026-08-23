import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { SettingsSection } from "@/lib/validation/settings";

export async function getSetting(
  section: SettingsSection,
): Promise<Record<string, unknown>> {
  const row = await prisma.setting.findUnique({ where: { key: section } });
  return (row?.value as Record<string, unknown>) ?? {};
}
