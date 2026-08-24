"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyDashboardTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function clearDashboardTheme() {
  const root = document.documentElement;
  root.classList.remove("dark");
  root.style.colorScheme = "light";
}

function persistTheme(theme: Theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.cookie = `${THEME_STORAGE_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new Event("nova-theme"));
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === "dark" || stored === "light") {
      return stored;
    }
  } catch {
    // Fall through to the document class set by SSR or the boot script.
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("nova-theme", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("nova-theme", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function ThemeProvider({
  children,
  initialTheme = "light",
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const theme = useSyncExternalStore(
    subscribe,
    readStoredTheme,
    () => initialTheme,
  );

  useEffect(() => {
    applyDashboardTheme(theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      clearDashboardTheme();
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyDashboardTheme(next);
    persistTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = readStoredTheme() === "dark" ? "light" : "dark";
    applyDashboardTheme(next);
    persistTheme(next);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
