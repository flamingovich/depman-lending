"use client";

import { Play } from "lucide-react";
import { CheckItem } from "@/components/miniapp/CheckItem";
import { PartnerLogo } from "@/components/miniapp/PartnerLogo";
import { isChannelKind } from "@/lib/partner-kind";
import { parseFeatures } from "@/lib/utils";

const YOUTUBE_RED = "#FF0000";

type FeaturedCardProps = {
  kind: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  accentColor: string;
  features: string;
  ctaText: string;
  affiliateUrl?: string | null;
};

export function FeaturedCard({
  kind,
  slug,
  name,
  logoUrl,
  logoLightUrl,
  logoDarkUrl,
  accentColor,
  features,
  ctaText,
  affiliateUrl,
}: FeaturedCardProps) {
  const items = parseFeatures(features).slice(0, 3);
  const isChannel = isChannelKind(kind);
  const brandColor = isChannel ? accentColor || YOUTUBE_RED : accentColor;
  const hasLogo = logoUrl || logoLightUrl || logoDarkUrl;

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
    <div className="featured-card-shell">
      <article className={`featured-card${isChannel ? " featured-card--youtube" : ""}`}>
        <div
          className={`featured-card-bg${isChannel ? " featured-card-bg--channel" : ""}`}
        />
        {isChannel ? (
          <div className="featured-card-glow-clip" aria-hidden>
            <div
              className="featured-card-glow featured-card-glow--person"
              style={{ backgroundColor: brandColor }}
            />
          </div>
        ) : (
          <div
            className="featured-card-glow featured-card-glow--default"
            style={{ backgroundColor: brandColor }}
          />
        )}

        <div
          className="featured-card-body relative flex min-h-[168px] flex-col p-3.5"
          style={isChannel ? { color: "#ffffff" } : undefined}
        >
        <div className="featured-card-main mb-2">
          <div className="mb-2 flex items-center gap-2">
            {hasLogo ? (
              <div className="featured-card-logo flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-1.5">
                <PartnerLogo
                  name={name}
                  logoUrl={logoUrl}
                  logoLightUrl={logoLightUrl}
                  logoDarkUrl={logoDarkUrl}
                  accentColor={brandColor}
                  variant="grid"
                  className="mx-auto object-center!"
                />
              </div>
            ) : null}
            <p
              className={`text-xl font-black uppercase tracking-tight ${
                isChannel ? "featured-card-youtube-name" : ""
              }`}
              style={isChannel ? { color: "#ffffff" } : { color: brandColor }}
            >
              {name}
            </p>
          </div>

          <ul className="space-y-0.5">
            {items.map((item) => (
              <CheckItem key={item} textOnDark={isChannel}>
                {item}
              </CheckItem>
            ))}
          </ul>
        </div>

        <div className="featured-card-cta relative z-10 mt-auto">
          <button
            type="button"
            onClick={openPartner}
            className={`relative z-10 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] py-2.5 text-xs font-bold transition active:scale-[0.98] ${
              isChannel ? "text-white" : "text-[#131323]"
            }`}
            style={{ backgroundColor: brandColor }}
          >
            <Play
              className={`h-3.5 w-3.5 ${isChannel ? "fill-white text-white" : "fill-current"}`}
            />
            {ctaText}
          </button>
        </div>
      </div>
    </article>

      {isChannel ? (
        <div className="featured-card-person-anchor" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/depman.png" alt="" className="featured-card-person" />
        </div>
      ) : null}
    </div>
  );
}
