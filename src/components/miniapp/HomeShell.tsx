"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { Gift, Star } from "lucide-react";
import { CasinoGridCard } from "@/components/miniapp/CasinoGridCard";
import { CompactPartnerCard } from "@/components/miniapp/CompactPartnerCard";
import { FeaturedCard } from "@/components/miniapp/FeaturedCard";
import { FooterInfo } from "@/components/miniapp/FooterInfo";
import { HeaderActions } from "@/components/miniapp/HeaderActions";
import { HomeSectionTitle } from "@/components/miniapp/HomeSectionTitle";
import { NewBonusesStrip } from "@/components/miniapp/NewBonusesStrip";
import { SearchOverlay } from "@/components/miniapp/SearchOverlay";
import { ViewerWinsStrip, type ViewerWinItem } from "@/components/miniapp/ViewerWinsStrip";
import { ALL_PARTNERS_INITIAL } from "@/lib/home-blocks";
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
  cardScreenshotUrl?: string | null;
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
  viewerWins: ViewerWinItem[];
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
  viewerWins,
  initialQuery = "",
}: HomeShellProps) {
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [showAllPartners, setShowAllPartners] = useState(false);

  const searchQuery = (initialQuery || searchParams.get("q") || "").trim();

  useEffect(() => {
    setShowAllPartners(false);
  }, [searchQuery]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return partners;
    return partners.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false),
    );
  }, [partners, searchQuery]);

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
  const visibleAllPartners = useMemo(
    () =>
      showAllPartners
        ? allPartners
        : allPartners.slice(0, ALL_PARTNERS_INITIAL),
    [allPartners, showAllPartners],
  );
  const hasMoreAllPartners =
    allPartners.length > ALL_PARTNERS_INITIAL && !showAllPartners;

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

  const [headerMounted, setHeaderMounted] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    setHeaderMounted(true);
  }, []);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setHeaderScrolled(window.scrollY > 6);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const header = (
    <header
      className={`app-header-glass fixed inset-x-0 top-0 z-30 pt-[var(--safe-top)] bg-[var(--header-bg)] transition-[backdrop-filter,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${headerScrolled ? "backdrop-blur-[40px]" : "backdrop-blur-[28px]"}`}
    >
      <HeaderActions
        searchPlaceholder={settings.searchPlaceholder}
        onOpenSearch={() => setSearchOpen(true)}
      />
    </header>
  );

  return (
    <>
      {headerMounted ? createPortal(header, document.body) : header}

      <main className="app-main-below-header tma-gutter-x space-y-3 overflow-visible pb-6">
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
          <section className="space-y-1.5">
            <HomeSectionTitle icon={Star} iconFilled>
              Лучшие проекты 2026 года
            </HomeSectionTitle>
            <div className="grid grid-cols-1 gap-2">
              {bestPartners.map((partner) => (
                <CasinoGridCard key={partner.id} partner={partner} />
              ))}
            </div>
          </section>
        ) : null}

        <ViewerWinsStrip wins={viewerWins} />

        {allPartners.length > 0 ? (
          <section className="space-y-1.5">
            <HomeSectionTitle icon={Gift}>
              Все проекты и бонусы
            </HomeSectionTitle>
            {visibleAllPartners.map((partner) => (
              <CompactPartnerCard
                key={partner.id}
                partner={{
                  ...partner,
                  bonusValue: stripBonusValue(partner),
                }}
              />
            ))}

            {hasMoreAllPartners ? (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllPartners(true)}
                  className="btn-outline-gold btn-outline-gold-play w-[min(100%,220px)] rounded-full px-6 py-2.5 text-sm font-bold"
                >
                  Показать больше
                </button>
              </div>
            ) : null}
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
        partners={partners
          .filter((p) => !isChannelKind(p.kind))
          .map((p) => ({
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
