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
    key: "notifyOnNewComment",
    label: "New comments",
    type: "checkbox",
    description: "Notify admins when a reader leaves a comment.",
  },
  {
    key: "notifyOnReviewSubmitted",
    label: "Article submitted for review",
    type: "checkbox",
    description: "Notify reviewers when an author submits an article.",
  },
  {
    key: "notifyOnAuthorRequest",
    label: "Author requests",
    type: "checkbox",
    description: "Notify admins when a reader requests author access.",
  },
  {
    key: "digestFrequency",
    label: "Digest frequency",
    type: "select",
    options: ["off", "daily", "weekly"],
  },
];

export default async function AdminNotificationsSettingsPage() {
  await requirePermission("settings:manage");
  const value = await getSetting("notifications");

  return (
    <div className="flex flex-col gap-6">
      <H1 className="text-2xl">Settings</H1>
      <SettingsTabs current="notifications" />
      <SettingsForm
        section="notifications"
        fields={FIELDS}
        initialValue={value}
      />
    </div>
  );
}
