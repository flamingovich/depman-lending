"use client";

import { useMemo } from "react";
import { Flame } from "lucide-react";
import { CheckItem } from "@/components/miniapp/CheckItem";
import { CardScreenshotBackdrop } from "@/components/miniapp/CardScreenshotBackdrop";
import { resolveLogoUrl } from "@/lib/logo-url";
import { PartnerLogo } from "@/components/miniapp/PartnerLogo";
import { parseFeatures } from "@/lib/utils";

const DEFAULT_PERSON_IMAGE = "/images/depman.png";

const COINS_FRONT = ["d", "e"] as const;

type FeaturedCardProps = {
  slug: string;
  name: string;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  personImageUrl?: string | null;
  cardScreenshotUrl?: string | null;
  featuredCoinImageUrl?: string | null;
  accentColor: string;
  features: string;
  affiliateUrl?: string | null;
};

export function FeaturedCard({
  slug,
  name,
  logoUrl,
  logoLightUrl,
  logoDarkUrl,
  personImageUrl,
  cardScreenshotUrl,
  featuredCoinImageUrl,
  accentColor,
  features,
  affiliateUrl,
}: FeaturedCardProps) {
  const brandColor = accentColor || "#ffd74d";
  const hasLogo = logoUrl || logoLightUrl || logoDarkUrl;
  const personSrc =
    resolveLogoUrl(personImageUrl ?? undefined) ?? DEFAULT_PERSON_IMAGE;
  const coinSrc = resolveLogoUrl(featuredCoinImageUrl ?? undefined);

  const featureItems = useMemo(
    () => parseFeatures(features).slice(0, 3),
    [features],
  );

  function openPartner() {
    if (!affiliateUrl) {
      window.location.href = `/partner/${slug}`;
      return;
    }
    const tg = window.Telegram?.WebApp;
    if (tg) tg.openLink(affiliateUrl);
    else window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="featured-card-wrap">
      <div className="featured-card-shell">
        <p className="featured-card-month-label">
          <Flame
            className="featured-card-month-label-icon"
            fill="currentColor"
            strokeWidth={1.5}
            aria-hidden
          />
          ПРОЕКТ МЕСЯЦА
        </p>
        <article
          className="featured-card featured-card--pinned"
          style={{ ["--featured-accent" as string]: brandColor }}
        >
          <div className="featured-card-bg featured-card-bg--pinned" />
          <CardScreenshotBackdrop url={cardScreenshotUrl} fadeSide="left" />

          <div className="featured-card-glow-clip" aria-hidden>
            <div
              className="featured-card-glow featured-card-glow--person"
              style={{ backgroundColor: brandColor }}
            />
          </div>

          <div className="featured-card-person-anchor" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={personSrc} alt="" className="featured-card-person" />

            {coinSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={coinSrc}
                alt=""
                className="featured-card-coin featured-card-coin--f"
              />
            ) : null}
          </div>

          {coinSrc ? (
            <div
              className="featured-card-coin-layer featured-card-coin-layer--front"
              aria-hidden
            >
              {COINS_FRONT.map((variant) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={variant}
                  src={coinSrc}
                  alt=""
                  className={`featured-card-coin featured-card-coin--${variant}`}
                />
              ))}
            </div>
          ) : null}

          <div className="featured-card-body relative flex min-h-[152px] flex-col p-3">
            <div className="featured-card-main mb-2">
              {hasLogo ? (
                <div className="featured-card-logo-slot mb-1.5 flex items-center">
                  <PartnerLogo
                    name={name}
                    logoUrl={logoUrl}
                    logoLightUrl={logoLightUrl}
                    logoDarkUrl={logoDarkUrl}
                    accentColor={brandColor}
                    variant="featured"
                    className="object-center!"
                  />
                </div>
              ) : null}

              {featureItems.length > 0 ? (
                <ul className="featured-features-panel space-y-0.5">
                  {featureItems.map((item) => (
                    <CheckItem
                      key={item}
                      textOnDark
                      accentColor={brandColor}
                    >
                      {item}
                    </CheckItem>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="featured-card-cta relative z-10 mt-auto">
              <button
                type="button"
                onClick={openPartner}
                className="relative z-10 flex w-full items-center justify-center rounded-[var(--radius-md)] py-2.5 text-xs font-bold text-white transition active:scale-[0.98]"
                style={{ backgroundColor: brandColor }}
              >
                Получить бонусы
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
