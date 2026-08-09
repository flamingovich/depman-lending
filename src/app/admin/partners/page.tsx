import Link from "next/link";
import { CopyShortLinkButton } from "@/components/admin/CopyShortLinkButton";
import { DeletePartnerButton } from "@/components/admin/DeletePartnerButton";
import { HomeLayoutManager } from "@/components/admin/HomeLayoutManager";
import { SyncAffiliateLinksButton } from "@/components/admin/SyncAffiliateLinksButton";
import { getSiteSettings } from "@/lib/data";
import { prisma } from "@/lib/db";
import { isChannelKind } from "@/lib/partner-kind";

export default async function AdminPartnersPage() {
  const [partners, settings] = await Promise.all([
    prisma.partner.findMany({
      include: { _count: { select: { bonuses: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    getSiteSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Проекты</h1>
          <p className="text-sm text-slate-400">
            Партнёрские проекты и их бонусы
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SyncAffiliateLinksButton />
          <Link
            href="/admin/partners/new"
            className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white"
          >
            + Новый проект
          </Link>
        </div>
      </div>

      <HomeLayoutManager
        pinnedPartnerId={settings.pinnedPartnerId}
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
          kind: partner.kind,
        }))}
      />

      <div className="admin-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="admin-table-head">
            <tr>
              <th className="px-4 py-3 font-semibold">Название</th>
              <th className="px-4 py-3 font-semibold">Royal ID</th>
              <th className="px-4 py-3 font-semibold">Блок</th>
              <th className="px-4 py-3 font-semibold">Статус</th>
              <th className="px-4 py-3 font-semibold">Бонусы</th>
              <th className="px-4 py-3 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id} className="border-b border-white/5">
                <td className="px-4 py-3">
                  <p className="font-bold">{partner.name}</p>
                  <p className="text-xs text-slate-400">/{partner.slug}</p>
                </td>
                <td className="px-4 py-3">
                  {partner.royalCampaignId ? (
                    <span className="font-mono text-xs text-slate-300">
                      {partner.royalCampaignId}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isChannelKind(partner.kind) ? (
                    <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-300">
                      Промо-канал
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      <span className="rounded-md bg-white/8 px-2 py-0.5 text-xs font-semibold text-slate-300">
                        Все
                      </span>
                      {partner.inTopStrip ? (
                        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
                          Сверху
                        </span>
                      ) : null}
                      {partner.inBestBlock ? (
                        <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-xs font-semibold text-violet-300">
                          Лучшие
                        </span>
                      ) : null}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {partner.isActive ? (
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                        Активен
                      </span>
                    ) : (
                      <span className="rounded-md bg-white/8 px-2 py-0.5 text-xs font-semibold text-slate-400">
                        Скрыт
                      </span>
                    )}
                    {isChannelKind(partner.kind) ? (
                      <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-300">
                        Канал
                      </span>
                    ) : null}
                    {partner.isFeatured && isChannelKind(partner.kind) ? (
                      <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                        Промо-канал
                      </span>
                    ) : null}
                    {settings.pinnedPartnerId === partner.id ? (
                      <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
                        Закреплён
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">{partner._count.bonuses}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/partners/${partner.id}`}
                      className="admin-btn-secondary px-3 py-1.5 text-xs"
                    >
                      Редактировать
                    </Link>
                    {partner.affiliateUrl ? (
                      <CopyShortLinkButton slug={partner.slug} compact />
                    ) : null}
                    <DeletePartnerButton id={partner.id} name={partner.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {partners.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">
            Пока нет проектов. Добавьте первый.
          </p>
        ) : null}
      </div>
    </div>
  );
}
