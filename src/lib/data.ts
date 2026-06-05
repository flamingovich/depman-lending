import { prisma } from "@/lib/db";

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

export async function getPartnerBySlug(slug: string) {
  return prisma.partner.findFirst({
    where: { slug, isActive: true },
    include: {
      bonuses: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
