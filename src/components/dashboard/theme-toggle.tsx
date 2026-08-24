"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/providers/theme-provider";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-11 w-11 items-center justify-center rounded-lg border bg-background text-foreground transition hover:bg-muted"
      aria-label="Toggle color theme"
    >
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="block h-4 w-4 dark:hidden" />
    </button>
  );
}
