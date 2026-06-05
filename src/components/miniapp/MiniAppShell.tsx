"use client";

import { ViewportScale } from "@/components/miniapp/ViewportScale";

type MiniAppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function MiniAppShell({ children, className = "" }: MiniAppShellProps) {
  return (
    <ViewportScale>
      <div className={`tma-shell ${className}`.trim()}>{children}</div>
    </ViewportScale>
  );
}
