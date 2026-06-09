import { Suspense } from "react";
import { HomeShell } from "@/components/miniapp/HomeShell";
import { MiniAppShell } from "@/components/miniapp/MiniAppShell";
import { getActivePartners, getActiveViewerWins, getSiteSettings } from "@/lib/data";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const [settings, partners, viewerWins] = await Promise.all([
    getSiteSettings(),
    getActivePartners(q),
    getActiveViewerWins(),
  ]);

  const serialized = partners.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    logoUrl: p.logoUrl,
    logoLightUrl: p.logoLightUrl,
    logoDarkUrl: p.logoDarkUrl,
    personImageUrl: p.personImageUrl,
    cardScreenshotUrl: p.cardScreenshotUrl,
    badge: p.badge,
    rating: p.rating,
    accentColor: p.accentColor,
    features: p.features,
    affiliateUrl: p.affiliateUrl,
    promoCode: p.promoCode,
    bonus1Label: p.bonus1Label,
    bonus1Value: p.bonus1Value,
    bonus2Label: p.bonus2Label,
    bonus2Value: p.bonus2Value,
    cardLayout: p.cardLayout,
    inTopStrip: p.inTopStrip,
    inBestBlock: p.inBestBlock,
    topSortOrder: p.topSortOrder,
    bestSortOrder: p.bestSortOrder,
    sortOrder: p.sortOrder,
    kind: p.kind,
    ctaText: p.ctaText,
    isFeatured: p.isFeatured,
    bonuses: p.bonuses.map((b) => ({ title: b.title, value: b.value })),
  }));

  return (
    <MiniAppShell>
      <Suspense fallback={null}>
        <HomeShell
          settings={{
            siteName: settings.siteName,
            siteTagline: settings.siteTagline,
            heroTitle: settings.heroTitle,
            searchPlaceholder: settings.searchPlaceholder,
          }}
          partners={serialized}
          viewerWins={viewerWins.map((win) => ({
            id: win.id,
            screenshotUrl: win.screenshotUrl,
            cropX: win.cropX,
            cropY: win.cropY,
            cropWidth: win.cropWidth,
            cropHeight: win.cropHeight,
            telegramUsername: win.telegramUsername,
            telegramDisplayName: win.telegramDisplayName,
            winAmount: win.winAmount,
            winMultiplier: win.winMultiplier,
            isBigWin: win.isBigWin,
            partner: win.partner,
          }))}
          initialQuery={q ?? ""}
        />
      </Suspense>
    </MiniAppShell>
  );
}
