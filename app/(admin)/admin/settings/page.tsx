import { requirePermission } from "@/lib/permissions/check";
import { RoutePlaceholder } from "@/components/shared/route-placeholder";

export default async function AdminSettingsPage() {
  await requirePermission("settings:manage");

  return (
    <RoutePlaceholder
      title="Settings"
      description="Site settings are not implemented yet."
    />
  );
}
