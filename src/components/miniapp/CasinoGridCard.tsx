"use client";

import { Check, Copy, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CheckItem } from "@/components/miniapp/CheckItem";
import { PartnerLogo } from "@/components/miniapp/PartnerLogo";
import { PaymentMethodsRow } from "@/components/miniapp/PaymentMethodsRow";
import { ReviewModal } from "@/components/miniapp/ReviewModal";
import { buildPartnerStats } from "@/lib/partner-stats";
import { parseFeatures } from "@/lib/utils";

export type GridPartner = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  accentColor: string;
  rating: number;
  features: string;
  promoCode?: string | null;
  bonus1Label?: string | null;
  bonus1Value?: string | null;
  bonus2Label?: string | null;
  bonus2Value?: string | null;
  ctaText: string;
  affiliateUrl?: string | null;
};

type CasinoGridCardProps = {
  partner: GridPartner;
  preview?: boolean;
};

export function CasinoGridCard({ partner, preview = false }: CasinoGridCardProps) {
  const [copied, setCopied] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const features = parseFeatures(partner.features).slice(0, 3);
  const stats = buildPartnerStats(partner);
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

  async function copyPromoCode(e: React.MouseEvent, code: string) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <article className="surface-card bonus-card flex flex-col rounded-[var(--radius-lg)] p-3">
        <div className="bonus-card-header">
          <div className="bonus-card-header-logo">
            <PartnerLogo
              name={partner.name}
              logoUrl={partner.logoUrl}
              logoLightUrl={partner.logoLightUrl}
              logoDarkUrl={partner.logoDarkUrl}
              accentColor={partner.accentColor}
              variant="gridHeader"
            />
          </div>
          <div className="bonus-card-header-meta">
            <div className="bonus-card-rating">
              <Star
                className="shrink-0 fill-[var(--accent)] text-[var(--accent)]"
                strokeWidth={0}
              />
              <span>{partner.rating.toFixed(1)}</span>
            </div>
            <button
              type="button"
              onClick={() => !preview && setReviewOpen(true)}
              className="btn-outline-gold bonus-card-review-btn"
              tabIndex={preview ? -1 : undefined}
            >
              Оставить отзыв
            </button>
          </div>
        </div>

        {stats.length > 0 ? (
          <div className="bonus-stats-panel mb-2.5">
            {stats.map((stat) => (
              <div key={stat.label} className="bonus-stat-row">
                <span className="bonus-stat-label">{stat.label}</span>
                <span className="bonus-stat-value">
                  <span className="bonus-stat-value-text">{stat.value}</span>
                  {stat.copyable ? (
                    <button
                      type="button"
                      onClick={(e) => copyPromoCode(e, stat.value)}
                      className="bonus-stat-copy"
                      aria-label={copied ? "Скопировано" : "Скопировать промокод"}
                      title={copied ? "Скопировано" : "Скопировать"}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={2.5} />
                      ) : (
                        <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                      )}
                    </button>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {features.length > 0 ? (
          <ul className="mb-2.5 space-y-1">
            {features.map((item) => (
              <CheckItem key={item}>{item}</CheckItem>
            ))}
          </ul>
        ) : null}

        <PaymentMethodsRow />

        <Link
          href={detailHref}
          onClick={openPartner}
          className="btn-outline-gold btn-outline-gold-play mt-auto flex items-center justify-center rounded-full py-2.5"
          tabIndex={preview ? -1 : undefined}
        >
          Играть на {partner.name}
        </Link>
      </article>

      {!preview ? (
        <ReviewModal
          open={reviewOpen}
          partnerId={partner.id}
          partnerName={partner.name}
          onClose={() => setReviewOpen(false)}
        />
      ) : null}
    </>
  );
}
