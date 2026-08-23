import { requirePermission } from "@/lib/permissions/check";
import { getSetting } from "@/lib/services/settings";
import { H1 } from "@/components/ui/typography";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import {
  SettingsForm,
  type SettingsFieldDef,
} from "@/components/admin/settings-form";

const FIELDS: SettingsFieldDef[] = [
  { key: "siteName", label: "Site name", type: "text" },
  { key: "tagline", label: "Tagline", type: "text" },
  { key: "supportEmail", label: "Support email", type: "email" },
  {
    key: "timezone",
    label: "Timezone",
    type: "select",
    options: [
      "UTC",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
    ],
  },
];

export default async function AdminGeneralSettingsPage() {
  await requirePermission("settings:manage");
  const value = await getSetting("general");

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Settings</H1>
      <SettingsTabs current="general" />
      <SettingsForm section="general" fields={FIELDS} initialValue={value} />
    </div>
  );
}
