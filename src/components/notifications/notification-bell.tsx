"use client";

import { Bell, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { isSafeRedirect } from "@/lib/security/security";
import { DropdownMenu, useDropdown } from "@/components/ui/dropdown-menu";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string | null;
};

export function NotificationBell() {
  const router = useRouter();
  const menu = useDropdown();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  async function markRead(notification: Notification) {
    await fetch(`/api/notifications/${notification.id}`, {
      method: "PATCH",
    });

    await loadNotifications();

    if (notification.link && isSafeRedirect(notification.link)) {
      menu.close();
      router.push(notification.link);
    }
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
        {...menu.triggerProps}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border bg-background transition hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <DropdownMenu
        open={menu.open}
        onClose={menu.close}
        triggerRef={menu.triggerRef}
        labelledBy={menu.triggerId}
        className="w-[min(22.5rem,calc(100vw-1.5rem))]"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => {
                void markAllRead();
              }}
              className="flex min-h-11 items-center gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3 w-3" />
              Mark all
            </button>
          )}
        </div>

        <div className="max-h-[min(26rem,60vh)] overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium">You&apos;re all caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No new notifications.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  void markRead(notification);
                }}
                className="flex w-full gap-3 border-b px-4 py-4 text-left transition hover:bg-muted"
              >
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    notification.isRead ? "bg-transparent" : "bg-foreground"
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground break-words">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {new Date(notification.createdAt)
                      .toISOString()
                      .replace("T", " ")
                      .split(".")[0]}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="border-t px-4 py-3">
          <Link
            href="/dashboard/notifications"
            onClick={menu.close}
            className="flex min-h-11 items-center justify-center text-sm font-medium hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenu>
    </div>
  );
}
