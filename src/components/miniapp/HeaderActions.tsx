"use client";

import Image from "next/image";
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
    <div className="tma-gutter-x header-bar flex items-center gap-2 py-2.5">
      <div className="header-brand flex min-w-0 shrink-0 items-center gap-2">
        <Image
          src="/images/depman_logo.png"
          alt=""
          width={40}
          height={40}
          className="header-brand-logo h-10 w-10 shrink-0 object-contain"
          priority
        />
        <div className="min-w-0 leading-none">
          <p className="header-brand-title">DEPMAN</p>
          <p className="header-brand-tagline">Портал Игрока</p>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
          }
          className="header-theme-btn shrink-0"
        >
          {theme === "dark" ? (
            <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
          ) : (
            <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
          )}
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          aria-label={searchPlaceholder}
          className="search-pill header-search-pill flex h-8 w-[148px] shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5"
        >
          <Search className="header-search-pill-icon h-3.5 w-3.5 shrink-0" strokeWidth={2.75} />
          <span className="header-search-pill-text truncate text-[11px] font-bold">
            {searchPlaceholder}
          </span>
        </button>
      </div>
    </div>
  );
}
