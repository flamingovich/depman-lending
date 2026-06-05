"use client";

import { useLayoutEffect } from "react";

export function AdminTheme({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const prevApp = root.dataset.app;
    const prevTheme = root.dataset.theme;

    root.dataset.app = "admin";
    root.dataset.theme = "dark";

    return () => {
      if (prevApp) root.dataset.app = prevApp;
      else root.removeAttribute("data-app");

      if (prevTheme) root.dataset.theme = prevTheme;
      else root.removeAttribute("data-theme");
    };
  }, []);

  return <>{children}</>;
}
