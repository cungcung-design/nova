export const THEME_STORAGE_KEY = "nova-theme";

export type Theme = "light" | "dark";

export function parseTheme(value: string | undefined | null): Theme {
  return value === "dark" ? "dark" : "light";
}

