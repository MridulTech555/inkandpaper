"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/services/notification-actions";
import type { NotificationEntry } from "@/components/shared/notification-bell";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function NotificationList({
  notifications,
}: {
  notifications: NotificationEntry[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const hasUnread = notifications.some((n) => !n.isRead);

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationReadAction(id);
      router.refresh();
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {hasUnread ? (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
          >
            Mark all read
          </Button>
        </div>
      ) : null}

      <ul className="border-border divide-border divide-y overflow-hidden rounded-lg border">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={cn(
              "flex items-start justify-between gap-4 p-4",
              !notification.isRead && "bg-surface",
            )}
          >
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2">
                {!notification.isRead ? (
                  <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                ) : null}
                <span className="text-foreground text-sm font-medium">
                  {notification.title}
                </span>
              </span>
              {notification.message ? (
                <p className="text-foreground-secondary text-sm">
                  {notification.message}
                </p>
              ) : null}
              <span className="text-foreground-muted text-xs">
                {formatDate(notification.createdAt)}
              </span>
            </div>
            {!notification.isRead ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkRead(notification.id)}
                disabled={isPending}
                className="shrink-0"
              >
                Mark read
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
