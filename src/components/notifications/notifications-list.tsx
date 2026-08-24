"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { isSafeRedirect } from "@/lib/security/security";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
  link: string | null;
};

export function NotificationsList({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  async function markRead(notification: NotificationItem) {
    setPendingId(notification.id);
    await fetch(`/api/notifications/${notification.id}`, { method: "PATCH" });
    router.refresh();
    setPendingId(null);

    if (notification.link && isSafeRedirect(notification.link)) {
      router.push(notification.link);
    }
  }

  async function markAll() {
    setMarkingAll(true);
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    router.refresh();
    setMarkingAll(false);
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">All Notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Full notification history for this workspace.
          </p>
        </div>
        {notifications.length > 0 ? (
          <button
            type="button"
            disabled={markingAll}
            onClick={() => {
              void markAll();
            }}
            className="h-11 rounded-xl border px-4 text-sm font-medium disabled:opacity-50"
          >
            {markingAll ? "Updating..." : "Mark all as read"}
          </button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          You&apos;re all caught up.
        </div>
      ) : (
        <div className="divide-y">
          {notifications.map((notification) => {
            const href =
              notification.link && isSafeRedirect(notification.link)
                ? notification.link
                : null;

            return (
              <button
                key={notification.id}
                type="button"
                disabled={pendingId === notification.id}
                onClick={() => {
                  void markRead(notification);
                }}
                className="flex w-full flex-col gap-2 px-6 py-5 text-left hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium break-words">
                    {notification.title}
                  </p>
                  {!notification.isRead ? (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-foreground" />
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground break-words">
                  {notification.message}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(notification.createdAt)
                    .toISOString()
                    .replace("T", " ")
                    .split(".")[0]}
                  {href ? " · Open related page" : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
