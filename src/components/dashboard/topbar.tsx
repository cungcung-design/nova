"use client";

import {
  Search,
} from "lucide-react";

import { CommandPalette } from "@/components/command-palette/command-palette";
import { NotificationBell } from "@/components/notifications/notification-bell";

type TopbarProps = {
  isAdmin: boolean;
};

export default function Topbar({
  isAdmin,
}: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b px-4 lg:px-6">
      <h1 className="text-lg font-semibold">
        Dashboard
      </h1>

      <div className="flex items-center gap-3">
        <CommandPalette
          isAdmin={isAdmin}
        />

        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(
              new KeyboardEvent(
                "keydown",
                {
                  key: "k",
                  ctrlKey: true,
                },
              ),
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg border md:hidden"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        <NotificationBell />
      </div>
    </header>
  );
}
