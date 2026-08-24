"use client";

import { ThemeToggle } from "@/components/dashboard/theme-toggle";

export function AppearanceSettings() {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="font-semibold">Appearance</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Switch between light and dark mode. Your choice is saved on this device.
      </p>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Theme</p>
          <p className="text-xs text-muted-foreground">
            <span className="dark:hidden">Light mode</span>
            <span className="hidden dark:inline">Dark mode</span>
          </p>
        </div>
        <ThemeToggle />
      </div>
    </section>
  );
}
