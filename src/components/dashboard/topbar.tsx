"use client";

import {
  Search,
} from "lucide-react";

import { CommandPalette } from "@/components/command-palette/command-palette";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

type TopbarProps = {
  isAdmin: boolean;
  role: string;
  currentWorkspace: {
    id: string;
    name: string;
    plan: string;
    role: string;
  };
  workspaces: {
    id: string;
    name: string;
    role: string;
  }[];
};

export default function Topbar({
  isAdmin,
  role,
  currentWorkspace,
  workspaces,
}: TopbarProps) {
  return (
    <header className="flex h-16 min-w-0 items-center justify-between gap-3 border-b px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav
          role={role}
          currentWorkspace={currentWorkspace}
          workspaces={workspaces}
        />
        <h1 className="truncate text-base font-semibold sm:text-lg">
          Dashboard
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
          className="flex h-11 w-11 items-center justify-center rounded-lg border md:hidden"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}
