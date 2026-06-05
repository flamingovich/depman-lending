import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [partnersCount, activeCount, bonusesCount] = await Promise.all([
    prisma.partner.count(),
    prisma.partner.count({ where: { isActive: true } }),
    prisma.bonus.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Обзор</h1>
        <p className="text-sm text-slate-400">
          Управляйте каталогом партнёрских проектов для Telegram Mini App
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Всего проектов" value={partnersCount} />
        <StatCard label="Активных" value={activeCount} />
        <StatCard label="Бонусов" value={bonusesCount} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/partners/new"
          className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white"
        >
          + Добавить проект
        </Link>
        <Link
          href="/"
          target="_blank"
          className="admin-btn-secondary px-4 py-3"
        >
          Открыть Mini App
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-card p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}
