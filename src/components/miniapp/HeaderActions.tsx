"use client";

import { Moon, Search, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

type HeaderActionsProps = {
  searchPlaceholder: string;
  onOpenSearch: () => void;
};

export function HeaderActions({
  searchPlaceholder,
  onOpenSearch,
}: HeaderActionsProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="tma-gutter-x flex items-center gap-2 py-2">
      <button
        type="button"
        onClick={onOpenSearch}
        aria-label={searchPlaceholder}
        className="search-pill flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-md)] px-3 text-left"
      >
        <Search className="h-4 w-4 shrink-0" style={{ color: "inherit" }} />
        <span
          className="truncate text-[13px] font-medium"
          style={{ color: "inherit" }}
        >
          {searchPlaceholder}
        </span>
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={
          theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
        }
        className="icon-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
      >
        {theme === "dark" ? (
          <Sun className="h-[18px] w-[18px]" />
        ) : (
          <Moon className="h-[18px] w-[18px]" />
        )}
      </button>
    </div>
  );
}
