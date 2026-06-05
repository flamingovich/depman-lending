"use client";

import { useLayoutEffect } from "react";

const TMA_DESIGN_WIDTH = 360;

function readViewportWidth() {
  const tg = window.Telegram?.WebApp as
    | (TelegramWebApp & { viewportStableWidth?: number })
    | undefined;
  const stable = tg?.viewportStableWidth;
  if (stable && stable > 0) return stable;

  const visual = window.visualViewport?.width;
  if (visual && visual > 0) return visual;

  return window.innerWidth;
}

function applyViewport() {
  const width = readViewportWidth();
  const root = document.documentElement;
  const gutter = Math.max(6, Math.min(10, Math.round(width * 0.018)));
  const peek = Math.max(18, Math.min(28, Math.round(width * 0.065)));
  const fontSize = Math.min(
    18,
    Math.max(15, (width / TMA_DESIGN_WIDTH) * 16),
  );

  root.dataset.app = "miniapp";
  root.style.fontSize = `${fontSize}px`;
  root.style.setProperty("--viewport-w", `${width}px`);
  root.style.setProperty("--app-gutter", `${gutter}px`);
  root.style.setProperty("--featured-person-peek", `${peek}px`);
}

export function ViewportScale({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    applyViewport();

    const onResize = () => applyViewport();
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("depman-telegram-ready", onResize);
    window.Telegram?.WebApp?.onEvent?.("viewportChanged", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("depman-telegram-ready", onResize);
      window.Telegram?.WebApp?.offEvent?.("viewportChanged", onResize);
      document.documentElement.removeAttribute("data-app");
      document.documentElement.style.fontSize = "";
      document.documentElement.style.removeProperty("--viewport-w");
      document.documentElement.style.removeProperty("--app-gutter");
      document.documentElement.style.removeProperty("--featured-person-peek");
    };
  }, []);

  return <>{children}</>;
}
