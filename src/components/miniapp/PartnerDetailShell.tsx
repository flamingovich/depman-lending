"use client";

import { ArrowLeft, Check, Copy, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { CheckItem } from "@/components/miniapp/CheckItem";
import { PartnerLogo } from "@/components/miniapp/PartnerLogo";
import { PaymentMethodsRow } from "@/components/miniapp/PaymentMethodsRow";
import { MiniAppShell } from "@/components/miniapp/MiniAppShell";
import { buildDetailCoreStats } from "@/lib/partner-stats";

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

const BONUS_CONDITIONS = [
  "Регистрация с промо",
  "Подтвержденный телефон и почта",
] as const;

export function PartnerDetailShell({ partner }: PartnerDetailShellProps) {
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const coreStats = buildDetailCoreStats(partner);
  const promoCode = partner.promoCode?.trim() || null;

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
    <MiniAppShell className="partner-detail-page min-h-dvh pb-6">
      <header className="partner-detail-header tma-gutter-x pt-[calc(8px+var(--safe-top))] pb-2">
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

      <main className="partner-detail-main tma-gutter-x pb-2">
        <article className="surface-card partner-detail-card flex flex-col rounded-[var(--radius-lg)] p-3">
          <div className="partner-detail-logo-wrap">
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

          <h1 className="sr-only">{partner.name}</h1>

          {promoCode ? (
            <div className="partner-detail-promo">
              <p className="partner-detail-promo-line">
                <span className="partner-detail-promo-label">Промокод:</span>{" "}
                <span className="partner-detail-promo-code">{promoCode}</span>
              </p>
              <button
                type="button"
                onClick={() => void copyPromoCode(promoCode)}
                className="partner-detail-promo-copy"
                aria-label={copied ? "Скопировано" : "Скопировать промокод"}
                title={copied ? "Скопировано" : "Скопировать"}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </button>
            </div>
          ) : null}

          <div className="bonus-stats-panel partner-detail-conditions mb-2.5">
            <p className="partner-detail-panel-title">Условия для получения бонуса</p>
            <ul className="space-y-1">
              {BONUS_CONDITIONS.map((item) => (
                <CheckItem key={item} iconVariant="green">
                  {item}
                </CheckItem>
              ))}
            </ul>
          </div>

          {coreStats.length > 0 ? (
            <div className="bonus-stats-panel mb-2.5">
              {coreStats.map((stat) => (
                <div key={`${stat.label}-${stat.value}`} className="bonus-stat-row">
                  <span className="bonus-stat-label">{stat.label}</span>
                  <span className="bonus-stat-value">
                    <span className="bonus-stat-value-text">{stat.value}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {partner.description ? (
            <p className="partner-detail-desc">{partner.description}</p>
          ) : null}

          {partner.features.length > 0 ? (
            <div className="bonus-stats-panel mb-2.5">
              <ul className="space-y-1">
                {partner.features.map((item) => (
                  <CheckItem key={item} iconVariant="gold">
                    {item}
                  </CheckItem>
                ))}
              </ul>
            </div>
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
      </main>
    </MiniAppShell>
  );
}
