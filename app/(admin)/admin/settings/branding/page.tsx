import { requirePermission } from "@/lib/permissions/check";
import { getSetting } from "@/lib/services/settings";
import { H1 } from "@/components/ui/typography";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import {
  SettingsForm,
  type SettingsFieldDef,
} from "@/components/admin/settings-form";

const FIELDS: SettingsFieldDef[] = [
  { key: "logoUrl", label: "Logo URL", type: "url", placeholder: "https://…" },
  {
    key: "faviconUrl",
    label: "Favicon URL",
    type: "url",
    placeholder: "https://…",
  },
  {
    key: "primaryColor",
    label: "Primary color",
    type: "text",
    placeholder: "#111111",
  },
  {
    key: "accentColor",
    label: "Accent color",
    type: "text",
    placeholder: "#6366f1",
  },
];

export default async function AdminBrandingSettingsPage() {
  await requirePermission("settings:manage");
  const value = await getSetting("branding");

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Settings</H1>
      <SettingsTabs current="branding" />
      <SettingsForm section="branding" fields={FIELDS} initialValue={value} />
    </div>
  );
}
