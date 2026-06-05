"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#050e1c] text-white lg:flex">
      <AdminNav />
      <main className="flex-1 p-5 md:p-8">{children}</main>
    </div>
  );
}
