import Link from "next/link";
import { DeletePartnerButton } from "@/components/admin/DeletePartnerButton";
import { HomeLayoutManager } from "@/components/admin/HomeLayoutManager";
import { prisma } from "@/lib/db";

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({
    include: { _count: { select: { bonuses: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Проекты</h1>
          <p className="text-sm text-slate-500">
            Партнёрские проекты и их бонусы
          </p>
        </div>
        <Link
          href="/admin/partners/new"
          className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white"
        >
          + Новый проект
        </Link>
      </div>

      <HomeLayoutManager
        partners={partners.map((partner) => ({
          id: partner.id,
          name: partner.name,
          slug: partner.slug,
          sortOrder: partner.sortOrder,
          inTopStrip: partner.inTopStrip,
          inBestBlock: partner.inBestBlock,
          topSortOrder: partner.topSortOrder,
          bestSortOrder: partner.bestSortOrder,
          isActive: partner.isActive,
          isFeatured: partner.isFeatured,
        }))}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Название</th>
              <th className="px-4 py-3 font-semibold">Блок</th>
              <th className="px-4 py-3 font-semibold">Статус</th>
              <th className="px-4 py-3 font-semibold">Бонусы</th>
              <th className="px-4 py-3 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id} className="border-b border-slate-50">
                <td className="px-4 py-3">
                  <p className="font-bold">{partner.name}</p>
                  <p className="text-xs text-slate-500">/{partner.slug}</p>
                </td>
                <td className="px-4 py-3">
                  {partner.isFeatured ? (
                    <span className="text-xs text-slate-500">Featured</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        Все
                      </span>
                      {partner.inTopStrip ? (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          Сверху
                        </span>
                      ) : null}
                      {partner.inBestBlock ? (
                        <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                          Лучшие
                        </span>
                      ) : null}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {partner.isActive ? (
                      <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Активен
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        Скрыт
                      </span>
                    )}
                    {partner.isFeatured ? (
                      <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">{partner._count.bonuses}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/partners/${partner.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                    >
                      Редактировать
                    </Link>
                    <DeletePartnerButton id={partner.id} name={partner.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {partners.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            Пока нет проектов. Добавьте первый.
          </p>
        ) : null}
      </div>
    </div>
  );
}
