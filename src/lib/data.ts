import { prisma } from "@/lib/db";
import { isChannelKind } from "@/lib/partner-kind";

export async function getSiteSettings() {
  let settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: "default" },
    });
  }

  return settings;
}

export async function getActivePartners(query?: string) {
  const partners = await prisma.partner.findMany({
    where: {
      isActive: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
            ],
          }
        : {}),
    },
    include: {
      bonuses: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
  });

  return partners;
}

export async function getActiveViewerWins() {
  return prisma.viewerWin.findMany({
    where: { isActive: true },
    include: {
      partner: {
        select: {
          id: true,
          slug: true,
          name: true,
          logoUrl: true,
          logoLightUrl: true,
          logoDarkUrl: true,
          accentColor: true,
          affiliateUrl: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getSubmitWinPartnerOptions() {
  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    select: { id: true, name: true, kind: true, sortOrder: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return partners
    .filter((partner) => !isChannelKind(partner.kind))
    .map(({ id, name }) => ({ id, name }));
}

const partnerInclude = {
  bonuses: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
  },
};

/**
 * Ссылки набирают руками, поэтому регистр не должен ничего решать:
 * depman.vip/BEEF обязан вести туда же, куда depman.vip/beef.
 * SQLite сравнивает строки побайтово, так что на промах ищем сами.
 */
export async function getPartnerBySlug(slug: string) {
  const trimmed = slug.trim();

  const exact = await prisma.partner.findFirst({
    where: { slug: trimmed, isActive: true },
    include: partnerInclude,
  });
  if (exact) return exact;

  const normalized = trimmed.toLowerCase();
  const candidates = await prisma.partner.findMany({
    where: { isActive: true },
    select: { id: true, slug: true },
  });
  const match = candidates.find(
    (partner) => partner.slug.toLowerCase() === normalized,
  );
  if (!match) return null;

  return prisma.partner.findUnique({
    where: { id: match.id },
    include: partnerInclude,
  });
}
