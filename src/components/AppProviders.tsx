"use client";

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TelegramProvider } from "@/components/telegram/TelegramProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TelegramProvider>{children}</TelegramProvider>
    </ThemeProvider>
  );
}
