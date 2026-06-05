"use client";

import { ExternalLink } from "lucide-react";

type PartnerCtaProps = {
  affiliateUrl?: string | null;
  ctaText: string;
  accentColor?: string;
};

export function PartnerCta({
  affiliateUrl,
  ctaText,
  accentColor = "#7c3aed",
}: PartnerCtaProps) {
  if (!affiliateUrl) return null;

  function handleClick() {
    const tg = window.Telegram?.WebApp;
    if (tg) tg.openLink(affiliateUrl!);
    else window.open(affiliateUrl!, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-lg active:scale-[0.98]"
      style={{ backgroundColor: accentColor }}
    >
      <ExternalLink className="h-4 w-4" />
      {ctaText}
    </button>
  );
}
