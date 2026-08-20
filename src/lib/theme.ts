export type ThemeMode = "light" | "dark";
export type ThemePreference = "auto" | ThemeMode;

export const THEME_STORAGE_KEY = "depman-theme-preference";

export function getStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "auto";
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  if (value === "light" || value === "dark") return value;
  return "auto";
}

export function storePreference(preference: ThemePreference) {
  if (preference === "auto") {
    localStorage.removeItem(THEME_STORAGE_KEY);
    return;
  }
  localStorage.setItem(THEME_STORAGE_KEY, preference);
}

export function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getTelegramTheme(): ThemeMode | null {
  const scheme = window.Telegram?.WebApp?.colorScheme;
  if (scheme === "light" || scheme === "dark") return scheme;
  return null;
}

/** Без явного выбора показываем тёмную тему — и в Telegram, и в вебе. */
export const DEFAULT_THEME: ThemeMode = "dark";

export function resolveTheme(preference: ThemePreference): ThemeMode {
  if (preference === "light" || preference === "dark") return preference;
  return DEFAULT_THEME;
}

export const TELEGRAM_THEME_COLORS: Record<
  ThemeMode,
  { header: string; background: string }
> = {
  light: { header: "#f3f4f9", background: "#f3f4f9" },
  dark: { header: "#050e1c", background: "#050e1c" },
};
