"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CasinoGridCard } from "@/components/miniapp/CasinoGridCard";
import { CompactPartnerCard } from "@/components/miniapp/CompactPartnerCard";
import { FeaturedCard } from "@/components/miniapp/FeaturedCard";
import { FooterInfo } from "@/components/miniapp/FooterInfo";
import { HeaderActions } from "@/components/miniapp/HeaderActions";
import { NewBonusesStrip } from "@/components/miniapp/NewBonusesStrip";
import { SearchOverlay } from "@/components/miniapp/SearchOverlay";
import { isChannelKind } from "@/lib/partner-kind";

export type HomePartner = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  personImageUrl?: string | null;
  badge?: string | null;
  rating: number;
  accentColor: string;
  features: string;
  affiliateUrl?: string | null;
  promoCode?: string | null;
  bonus1Label?: string | null;
  bonus1Value?: string | null;
  bonus2Label?: string | null;
  bonus2Value?: string | null;
  cardLayout: string;
  inTopStrip: boolean;
  inBestBlock: boolean;
  topSortOrder: number;
  bestSortOrder: number;
  ctaText: string;
  kind: string;
  isFeatured: boolean;
  sortOrder: number;
  bonuses: { title: string; value?: string | null }[];
};

type HomeShellProps = {
  settings: {
    siteName: string;
    siteTagline: string;
    heroTitle: string;
    searchPlaceholder: string;
  };
  partners: HomePartner[];
  initialQuery?: string;
};

function stripBonusValue(partner: HomePartner) {
  const b = partner.bonuses[0];
  if (!b) return null;
  if (b.value) return b.value;
  return b.title;
}

function sortPartners(list: HomePartner[]) {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function HomeShell({
  settings,
  partners,
  initialQuery = "",
}: HomeShellProps) {
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = (initialQuery || searchParams.get("q") || "").trim().toLowerCase();
    if (!q) return partners;
    return partners.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false),
    );
  }, [partners, initialQuery, searchParams]);

  const channels = useMemo(
    () => filtered.filter((p) => isChannelKind(p.kind)),
    [filtered],
  );
  const casinos = useMemo(
    () => filtered.filter((p) => !isChannelKind(p.kind)),
    [filtered],
  );

  const channelPromo =
    channels.find((p) => p.isFeatured) ?? channels[0] ?? null;

  const topPartners = useMemo(
    () =>
      [...casinos]
        .filter((p) => p.inTopStrip)
        .sort((a, b) => a.topSortOrder - b.topSortOrder),
    [casinos],
  );

  const bestPartners = useMemo(
    () =>
      [...casinos]
        .filter((p) => p.inBestBlock)
        .sort((a, b) => a.bestSortOrder - b.bestSortOrder),
    [casinos],
  );

  const allPartners = useMemo(() => sortPartners(casinos), [casinos]);

  const newStrip = topPartners.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    logoUrl: p.logoUrl,
    logoLightUrl: p.logoLightUrl,
    logoDarkUrl: p.logoDarkUrl,
    accentColor: p.accentColor,
    bonusValue: stripBonusValue(p),
    badge: p.badge,
  }));

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b border-[var(--border)] pt-[var(--safe-top)] backdrop-blur-xl"
        style={{ background: "var(--header-bg)" }}
      >
        <HeaderActions
          searchPlaceholder={settings.searchPlaceholder}
          onOpenSearch={() => setSearchOpen(true)}
        />
      </header>

      <main className="tma-gutter-x space-y-3 overflow-visible pb-6 pt-2">
        <NewBonusesStrip partners={newStrip} />

        {channelPromo ? (
          <div className="featured-card-wrap">
            <FeaturedCard
              kind={channelPromo.kind}
              slug={channelPromo.slug}
              name={channelPromo.name}
              logoUrl={channelPromo.logoUrl}
              logoLightUrl={channelPromo.logoLightUrl}
              logoDarkUrl={channelPromo.logoDarkUrl}
              personImageUrl={channelPromo.personImageUrl}
              accentColor={channelPromo.accentColor}
              features={channelPromo.features}
              ctaText={channelPromo.ctaText}
              affiliateUrl={channelPromo.affiliateUrl}
            />
          </div>
        ) : null}

        {bestPartners.length > 0 ? (
          <section className="grid grid-cols-1 gap-2">
            {bestPartners.map((partner) => (
              <CasinoGridCard key={partner.id} partner={partner} />
            ))}
          </section>
        ) : null}

        {allPartners.length > 0 ? (
          <section className="space-y-1.5">
            {allPartners.map((partner) => (
              <CompactPartnerCard
                key={partner.id}
                partner={{
                  ...partner,
                  bonusValue: stripBonusValue(partner),
                }}
              />
            ))}
          </section>
        ) : null}

        {filtered.length === 0 && !channelPromo && casinos.length === 0 ? (
          <p className="surface-card rounded-[var(--radius-lg)] p-6 text-center text-sm text-[var(--muted)]">
            Проекты не найдены
          </p>
        ) : null}

        <FooterInfo />
      </main>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        placeholder={settings.searchPlaceholder}
        partners={partners.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          logoUrl: p.logoUrl,
          logoLightUrl: p.logoLightUrl,
          logoDarkUrl: p.logoDarkUrl,
          accentColor: p.accentColor,
        }))}
        initialQuery={initialQuery}
      />
    </>
  );
}
