"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { PartnerLogo } from "@/components/miniapp/PartnerLogo";

export type CompactPartner = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  accentColor: string;
  bonusValue?: string | null;
  ctaText: string;
  affiliateUrl?: string | null;
};

export function CompactPartnerCard({
  partner,
  preview = false,
}: {
  partner: CompactPartner;
  preview?: boolean;
}) {
  const detailHref = preview ? "#" : `/partner/${partner.slug}`;

  function openPartner(e: React.MouseEvent) {
    if (preview) {
      e.preventDefault();
      return;
    }
    if (!partner.affiliateUrl) return;
    e.preventDefault();
    const tg = window.Telegram?.WebApp;
    if (tg) tg.openLink(partner.affiliateUrl);
    else window.open(partner.affiliateUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <article className="surface-card flex items-center gap-2.5 rounded-[var(--radius-lg)] p-2.5">
      <Link
        href={detailHref}
        onClick={preview ? (e) => e.preventDefault() : undefined}
        className="compact-logo flex h-[68px] w-[84px] shrink-0 items-center justify-center p-2"
        tabIndex={preview ? -1 : undefined}
      >
        <PartnerLogo
          name={partner.name}
          logoUrl={partner.logoUrl}
          logoLightUrl={partner.logoLightUrl}
          logoDarkUrl={partner.logoDarkUrl}
          accentColor={partner.accentColor}
          variant="compact"
          className="text-center"
        />
      </Link>

      <div className="min-w-0 flex-1">
        {partner.bonusValue ? (
          <p className="bonus-stat-item mb-1.5 truncate px-2 py-1.5 text-center text-[10px] font-bold text-[var(--text)]">
            {partner.bonusValue}
          </p>
        ) : null}
        <Link
          href={detailHref}
          onClick={openPartner}
          className="btn-outline-gold btn-outline-gold-play inline-flex w-full items-center justify-center rounded-[var(--radius-sm)] py-2.5"
          tabIndex={preview ? -1 : undefined}
        >
          {partner.ctaText}
        </Link>
      </div>

      <Link
        href={detailHref}
        onClick={preview ? (e) => e.preventDefault() : undefined}
        className="info-btn flex h-6 w-6 shrink-0 items-center justify-center"
        aria-label="Подробнее"
        tabIndex={preview ? -1 : undefined}
      >
        <Info className="h-3.5 w-3.5 text-[var(--muted)]" />
      </Link>
    </article>
  );
}
