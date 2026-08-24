"use client";

import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { useTheme } from "@/providers/theme-provider";

export function AppearanceSettings() {
  const { theme } = useTheme();

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="font-semibold">Appearance</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Switch between light and dark mode. Your choice is saved on this device.
      </p>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Theme</p>
          <p className="text-xs capitalize text-muted-foreground">{theme} mode</p>
        </div>
        <ThemeToggle />
      </div>
    </section>
  );
}
