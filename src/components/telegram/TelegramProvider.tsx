"use client";

import { useEffect } from "react";

function loadTelegramScript() {
  return new Promise<void>((resolve) => {
    if (window.Telegram?.WebApp) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[src="https://telegram.org/js/telegram-web-app.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;

    loadTelegramScript().then(() => {
      if (cancelled) return;

      const tg = window.Telegram?.WebApp;
      if (!tg) return;

      tg.ready();
      tg.expand();

      if (
        "isVersionAtLeast" in tg &&
        typeof tg.isVersionAtLeast === "function" &&
        tg.isVersionAtLeast("6.2")
      ) {
        tg.enableClosingConfirmation?.();
      }

      window.dispatchEvent(new Event("depman-telegram-ready"));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
