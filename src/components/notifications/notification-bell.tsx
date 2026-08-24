"use client";

import { Bell, Check } from "lucide-react";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string | null;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  async function loadNotifications() {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadNotifications();
    }, 0);

    const interval = window.setInterval(loadNotifications, 30000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  async function markRead(notificationId: string) {
    await fetch(`/api/notifications/${notificationId}`, {
      method: "PATCH",
    });

    await loadNotifications();
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", {
      method: "PATCH",
    });

    await loadNotifications();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border bg-background transition hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold">
                  Notifications
                </h3>

                <p className="text-xs text-muted-foreground">
                  {unreadCount} unread
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Check className="h-3 w-3" />

                  Mark all
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />

                  <p className="mt-3 text-sm font-medium">
                    You&apos;re all caught up
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    No new notifications.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className="flex w-full gap-3 border-b px-4 py-4 text-left transition hover:bg-muted"
                  >
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        notification.isRead ? "bg-transparent" : "bg-foreground"
                      }`}
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {new Date(notification.createdAt).toISOString().replace("T", " ").split(".")[0]}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
