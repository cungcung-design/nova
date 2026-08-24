"use client";

import { NotificationBell } from "@/components/notifications/notification-bell";

export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="text-lg font-semibold">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <NotificationBell />
      </div>
    </header>
  );
}
