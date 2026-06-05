"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Settings, LogOut, FolderKanban } from "lucide-react";

const links = [
  { href: "/admin", label: "Обзор", icon: LayoutGrid },
  { href: "/admin/partners", label: "Проекты", icon: FolderKanban },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-full border-b border-slate-200 bg-white lg:w-64 lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-4 lg:block">
        <div>
          <p className="text-lg font-extrabold tracking-tight">DepMan Admin</p>
          <p className="text-xs text-slate-500">Управление партнёрами</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 lg:mt-4"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap ${
                active
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-700 lg:bg-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 lg:mt-2"
        >
          Открыть Mini App →
        </Link>
      </nav>
    </aside>
  );
}
