"use client";

import { ArrowLeft, Check, Copy, Moon, Star, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { CheckItem } from "@/components/miniapp/CheckItem";
import { PartnerLogo, usePartnerLogoSrc } from "@/components/miniapp/PartnerLogo";
import { PaymentMethodsRow } from "@/components/miniapp/PaymentMethodsRow";
import { MiniAppShell } from "@/components/miniapp/MiniAppShell";
import { ReviewModal } from "@/components/miniapp/ReviewModal";
import { buildPartnerStats } from "@/lib/partner-stats";

export type PartnerDetailData = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  accentColor: string;
  rating: number;
  features: string[];
  promoCode?: string | null;
  bonus1Label?: string | null;
  bonus1Value?: string | null;
  bonus2Label?: string | null;
  bonus2Value?: string | null;
  affiliateUrl?: string | null;
  bonuses: { id: string; title: string; value?: string | null; description?: string | null }[];
};

type PartnerDetailShellProps = {
  partner: PartnerDetailData;
};

function buildDetailStats(partner: PartnerDetailData) {
  const stats = buildPartnerStats(partner);
  const seen = new Set(stats.map((row) => `${row.label}:${row.value}`));

  for (const bonus of partner.bonuses) {
    const value = bonus.value?.trim() || bonus.title.trim();
    if (!value) continue;

    const key = `${bonus.title}:${value}`;
    if (seen.has(key)) continue;

    stats.push({
      label: bonus.title,
      value,
    });
    seen.add(key);
  }

  return stats;
}

export function PartnerDetailShell({ partner }: PartnerDetailShellProps) {
  const { theme, toggleTheme } = useTheme();
  const logoSrc = usePartnerLogoSrc(
    partner.logoUrl,
    partner.logoLightUrl,
    partner.logoDarkUrl,
  );
  const [copied, setCopied] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const stats = buildDetailStats(partner);

  function openPartner() {
    if (!partner.affiliateUrl) return;
    const tg = window.Telegram?.WebApp;
    if (tg) tg.openLink(partner.affiliateUrl);
    else window.open(partner.affiliateUrl, "_blank", "noopener,noreferrer");
  }

  async function copyPromoCode(code: string) {
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
      <MiniAppShell className="min-h-dvh pb-6">
        <header className="partner-detail-header px-3 pt-[calc(8px+var(--safe-top))] pb-2">
          <Link href="/" className="partner-detail-back">
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            Назад
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
            }
            className="icon-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
          >
            {theme === "dark" ? (
              <Sun className="h-[17px] w-[17px]" />
            ) : (
              <Moon className="h-[17px] w-[17px]" />
            )}
          </button>
        </header>

        <main className="space-y-3 px-3 pb-2">
          <article className="surface-card partner-detail-card flex flex-col rounded-[var(--radius-lg)] p-3">
            <div className="partner-detail-logo-wrap logo-box">
              <div className="partner-detail-logo-crop">
                <PartnerLogo
                  name={partner.name}
                  logoUrl={partner.logoUrl}
                  logoLightUrl={partner.logoLightUrl}
                  logoDarkUrl={partner.logoDarkUrl}
                  accentColor={partner.accentColor}
                  variant="detail"
                />
              </div>
            </div>

            <div className="bonus-card-header">
              {logoSrc ? (
                <span className="sr-only">{partner.name}</span>
              ) : (
                <h1 className="partner-detail-title">{partner.name}</h1>
              )}
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
                  onClick={() => setReviewOpen(true)}
                  className="btn-outline-gold bonus-card-review-btn"
                >
                  Оставить отзыв
                </button>
              </div>
            </div>

            {partner.description ? (
              <p className="partner-detail-desc">{partner.description}</p>
            ) : null}

            {stats.length > 0 ? (
              <div className="bonus-stats-panel mb-2.5">
                {stats.map((stat) => (
                  <div key={`${stat.label}-${stat.value}`} className="bonus-stat-row">
                    <span className="bonus-stat-label">{stat.label}</span>
                    <span className="bonus-stat-value">
                      <span className="bonus-stat-value-text">{stat.value}</span>
                      {stat.copyable ? (
                        <button
                          type="button"
                          onClick={() => copyPromoCode(stat.value)}
                          className="bonus-stat-copy"
                          aria-label={copied ? "Скопировано" : "Скопировать промокод"}
                          title={copied ? "Скопировано" : "Скопировать"}
                        >
                          {copied ? (
                            <Check
                              className="h-3.5 w-3.5 text-[var(--accent)]"
                              strokeWidth={2.5}
                            />
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

            {partner.features.length > 0 ? (
              <ul className="mb-2.5 space-y-1">
                {partner.features.map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
            ) : null}

            <PaymentMethodsRow />

            {partner.affiliateUrl ? (
              <button
                type="button"
                onClick={openPartner}
                className="btn-outline-gold btn-outline-gold-play mt-auto flex w-full items-center justify-center rounded-full py-2.5"
              >
                Играть на {partner.name}
              </button>
            ) : null}
          </article>

          {partner.affiliateUrl ? (
            <p className="partner-detail-disclaimer">Переход по партнёрской ссылке</p>
          ) : null}
        </main>

        <ReviewModal
          open={reviewOpen}
          partnerId={partner.id}
          partnerName={partner.name}
          onClose={() => setReviewOpen(false)}
        />
      </MiniAppShell>
    </>
  );
}
