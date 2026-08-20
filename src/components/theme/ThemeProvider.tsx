"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_THEME,
  resolveTheme,
  storePreference,
  getStoredPreference,
  TELEGRAM_THEME_COLORS,
  type ThemeMode,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemeMode;
  preference: ThemePreference;
  isAuto: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", TELEGRAM_THEME_COLORS[theme].background);
  }

  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  const colors = TELEGRAM_THEME_COLORS[theme];
  if (
    "isVersionAtLeast" in tg &&
    typeof tg.isVersionAtLeast === "function" &&
    tg.isVersionAtLeast("6.9")
  ) {
    tg.setHeaderColor?.(colors.header);
    tg.setBackgroundColor?.(colors.background);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("auto");
  const [theme, setTheme] = useState<ThemeMode>(DEFAULT_THEME);

  const syncResolvedTheme = useCallback((pref: ThemePreference) => {
    const resolved = resolveTheme(pref);
    setTheme(resolved);
    applyThemeToDocument(resolved);
  }, []);

  useEffect(() => {
    const stored = getStoredPreference();
    setPreferenceState(stored);
    syncResolvedTheme(stored);

    const markThemeReady = () => {
      document.documentElement.setAttribute("data-theme-ready", "");
    };
    // rAF не срабатывает в фоновой вкладке, поэтому дублируем таймером.
    const readyFrame = requestAnimationFrame(markThemeReady);
    const readyTimer = window.setTimeout(markThemeReady, 200);

    const onSystemChange = () => {
      if (getStoredPreference() === "auto") {
        syncResolvedTheme("auto");
      }
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", onSystemChange);

    const onTelegramTheme = () => {
      if (getStoredPreference() === "auto") {
        syncResolvedTheme("auto");
      }
    };

    const onTelegramReady = () => {
      if (getStoredPreference() === "auto") {
        syncResolvedTheme("auto");
      }
    };

    window.Telegram?.WebApp?.onEvent?.("themeChanged", onTelegramTheme);
    window.addEventListener("depman-telegram-ready", onTelegramReady);

    return () => {
      cancelAnimationFrame(readyFrame);
      window.clearTimeout(readyTimer);
      media.removeEventListener("change", onSystemChange);
      window.Telegram?.WebApp?.offEvent?.("themeChanged", onTelegramTheme);
      window.removeEventListener("depman-telegram-ready", onTelegramReady);
    };
  }, [syncResolvedTheme]);

  const setPreference = useCallback(
    (next: ThemePreference) => {
      storePreference(next);
      setPreferenceState(next);
      syncResolvedTheme(next);
    },
    [syncResolvedTheme],
  );

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setPreference(next);
  }, [theme, setPreference]);

  const value = useMemo(
    () => ({
      theme,
      preference,
      isAuto: preference === "auto",
      toggleTheme,
    }),
    [theme, preference, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
