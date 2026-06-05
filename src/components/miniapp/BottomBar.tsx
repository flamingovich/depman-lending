"use client";

import { HardHat, Star, X } from "lucide-react";
import { useState } from "react";

type BottomBarProps = {
  title: string;
  rating: number;
  ctaText: string;
  botUrl?: string | null;
};

export function BottomBar({ title, rating, ctaText, botUrl }: BottomBarProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  function handleCta() {
    if (botUrl) {
      const tg = window.Telegram?.WebApp;
      if (tg) tg.openLink(botUrl);
      else window.open(botUrl, "_blank", "noopener,noreferrer");
      return;
    }
    window.Telegram?.WebApp?.expand();
  }

  return (
    <div
      className="fixed right-0 bottom-0 left-0 z-40 mx-auto w-full max-w-[480px] px-3"
      style={{ paddingBottom: "calc(12px + var(--safe-bottom))" }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[var(--text)] shadow-2xl ring-1 ring-[var(--border)] backdrop-blur-xl"
        style={{ background: "var(--surface-elevated)" }}
      >
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Закрыть"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)]"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]">
          <HardHat className="h-4 w-4 text-[#131323]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-[var(--accent)] text-[var(--accent)]"
                />
              ))}
            </div>
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCta}
          className="btn-accent shrink-0 rounded-xl px-4 py-2 text-sm"
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
}
