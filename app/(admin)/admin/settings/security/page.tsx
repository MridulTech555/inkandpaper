import { requirePermission } from "@/lib/permissions/check";
import { getSetting } from "@/lib/services/settings";
import { H1 } from "@/components/ui/typography";
import { SettingsTabs } from "@/components/admin/settings-tabs";
import {
  SettingsForm,
  type SettingsFieldDef,
} from "@/components/admin/settings-form";

const FIELDS: SettingsFieldDef[] = [
  {
    key: "requireTwoFactorForAdmins",
    label: "Require 2FA for admins",
    type: "checkbox",
    description: "Applies to Super Admin, Admin, and Editor roles.",
  },
  {
    key: "allowPublicRegistration",
    label: "Allow public registration",
    type: "checkbox",
    description: "Let new readers create their own accounts.",
  },
  {
    key: "sessionDurationDays",
    label: "Session duration (days)",
    type: "text",
    placeholder: "30",
  },
];

export default async function AdminSecuritySettingsPage() {
  await requirePermission("settings:manage");
  const value = await getSetting("security");

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Settings</H1>
      <SettingsTabs current="security" />
      <SettingsForm section="security" fields={FIELDS} initialValue={value} />
    </div>
  );
}
