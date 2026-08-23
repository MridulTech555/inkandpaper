import { requirePermission } from "@/lib/permissions/check";
import { getSetting } from "@/lib/services/settings";
import { H1 } from "@/components/ui/typography";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import {
  SettingsForm,
  type SettingsFieldDef,
} from "@/components/admin/settings-form";

const FIELDS: SettingsFieldDef[] = [
  { key: "defaultMetaTitle", label: "Default meta title", type: "text" },
  {
    key: "defaultMetaDescription",
    label: "Default meta description",
    type: "textarea",
  },
  {
    key: "defaultOgImage",
    label: "Default social share image",
    type: "url",
    placeholder: "https://…",
  },
  {
    key: "twitterHandle",
    label: "Twitter/X handle",
    type: "text",
    placeholder: "@inknpaper",
  },
];

export default async function AdminSeoSettingsPage() {
  await requirePermission("settings:manage");
  const value = await getSetting("seo");

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Settings</H1>
      <SettingsTabs current="seo" />
      <SettingsForm section="seo" fields={FIELDS} initialValue={value} />
    </div>
  );
}
