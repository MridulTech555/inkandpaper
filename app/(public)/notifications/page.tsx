import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { requireUser } from "@/lib/permissions/check";
import { getUserNotifications } from "@/lib/services/notifications";
import { H1 } from "@/components/ui/typography";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationList } from "@/components/shared/notification-list";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getUserNotifications(user.id, 100);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <H1>Notifications</H1>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Updates about your articles and account activity will show up here."
        />
      ) : (
        <NotificationList notifications={notifications} />
      )}
    </div>
  );
}
