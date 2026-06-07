import { ViewerWinsManager } from "@/components/admin/ViewerWinsManager";
import { prisma } from "@/lib/db";
import { isChannelKind } from "@/lib/partner-kind";

export default async function AdminViewerWinsPage() {
  const [wins, partners] = await Promise.all([
    prisma.viewerWin.findMany({
      include: {
        partner: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.partner.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, kind: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const casinoPartners = partners.filter((partner) => !isChannelKind(partner.kind));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Заносы зрителей</h1>
        <p className="text-sm text-slate-400">
          Карусель между блоками «Лучшие» и «Все проекты» на главной
        </p>
      </div>

      <ViewerWinsManager
        wins={wins}
        partners={casinoPartners.map(({ id, name, slug }) => ({ id, name, slug }))}
      />
    </div>
  );
}
