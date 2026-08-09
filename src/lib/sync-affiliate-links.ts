import { prisma } from "@/lib/db";
import {
  fetchRoyalPromosForCampaigns,
  promoActiveUrl,
} from "@/lib/royal-promos-fetch";
import { revalidateCatalogPages } from "@/lib/revalidate-catalog";

export type AffiliateSyncDetail = {
  partnerId: string;
  name: string;
  slug: string;
  campaignId: string;
  status: "updated" | "unchanged" | "missing";
  oldUrl?: string | null;
  newUrl?: string | null;
};

export type AffiliateSyncResult = {
  updated: number;
  skipped: number;
  missing: number;
  details: AffiliateSyncDetail[];
};

export async function syncAffiliateLinksFromRoyal(): Promise<AffiliateSyncResult> {
  const token = process.env.ROYAL_PARTNERS_TOKEN?.trim();
  if (!token) {
    throw new Error("ROYAL_PARTNERS_TOKEN is not set");
  }

  const partners = await prisma.partner.findMany({
    where: {
      isActive: true,
      royalCampaignId: { not: null },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      affiliateUrl: true,
      royalCampaignId: true,
    },
  });

  const withCampaign = partners.filter(
    (p): p is typeof p & { royalCampaignId: string } =>
      Boolean(p.royalCampaignId?.trim()),
  );

  if (withCampaign.length === 0) {
    return { updated: 0, skipped: 0, missing: 0, details: [] };
  }

  const campaignIds = [
    ...new Set(withCampaign.map((p) => p.royalCampaignId.trim())),
  ];
  const promos = await fetchRoyalPromosForCampaigns(token, campaignIds);
  const urlByCampaign = new Map<string, string>();
  for (const promo of promos) {
    const cid = promo.campaign?.id;
    if (cid == null) continue;
    const url = promoActiveUrl(promo);
    if (url) urlByCampaign.set(String(cid), url);
  }

  const details: AffiliateSyncDetail[] = [];
  let updated = 0;
  let skipped = 0;
  let missing = 0;
  let changed = false;

  for (const partner of withCampaign) {
    const campaignId = partner.royalCampaignId.trim();
    const newUrl = urlByCampaign.get(campaignId) ?? null;

    if (!newUrl) {
      missing += 1;
      details.push({
        partnerId: partner.id,
        name: partner.name,
        slug: partner.slug,
        campaignId,
        status: "missing",
        oldUrl: partner.affiliateUrl,
        newUrl: null,
      });
      continue;
    }

    if (partner.affiliateUrl === newUrl) {
      skipped += 1;
      details.push({
        partnerId: partner.id,
        name: partner.name,
        slug: partner.slug,
        campaignId,
        status: "unchanged",
        oldUrl: partner.affiliateUrl,
        newUrl,
      });
      continue;
    }

    await prisma.partner.update({
      where: { id: partner.id },
      data: {
        affiliateUrl: newUrl,
        affiliateUrlSyncedAt: new Date(),
        affiliateUrlSource: "royal_promos",
      },
    });

    updated += 1;
    changed = true;
    details.push({
      partnerId: partner.id,
      name: partner.name,
      slug: partner.slug,
      campaignId,
      status: "updated",
      oldUrl: partner.affiliateUrl,
      newUrl,
    });
  }

  if (changed) {
    revalidateCatalogPages();
  }

  return { updated, skipped, missing, details };
}
