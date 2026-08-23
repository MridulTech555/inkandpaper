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
    key: "googleAnalyticsId",
    label: "Google Analytics ID",
    type: "text",
    placeholder: "G-XXXXXXX",
  },
  {
    key: "slackWebhookUrl",
    label: "Slack webhook URL",
    type: "url",
    placeholder: "https://hooks.slack.com/…",
  },
  {
    key: "mailProvider",
    label: "Transactional email provider",
    type: "select",
    options: ["none", "resend", "sendgrid", "postmark"],
  },
];

export default async function AdminIntegrationsSettingsPage() {
  await requirePermission("settings:manage");
  const value = await getSetting("integrations");

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Settings</H1>
      <SettingsTabs current="integrations" />
      <SettingsForm
        section="integrations"
        fields={FIELDS}
        initialValue={value}
      />
    </div>
  );
}
