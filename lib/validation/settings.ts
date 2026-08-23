import { z } from "zod";

export const settingsValueSchema = z.record(
  z.string(),
  z.union([z.string().max(500), z.boolean(), z.number()]),
);

export type SettingsValue = z.infer<typeof settingsValueSchema>;

export const SETTINGS_SECTIONS = [
  "general",
  "branding",
  "seo",
  "notifications",
  "security",
  "integrations",
] as const;

export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];
