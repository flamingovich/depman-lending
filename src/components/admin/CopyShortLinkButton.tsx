"use client";

import { buildPartnerShortLink } from "@/lib/short-link";
import { useState } from "react";

type CopyShortLinkButtonProps = {
  slug: string;
  compact?: boolean;
};

export function CopyShortLinkButton({
  slug,
  compact = false,
}: CopyShortLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const shortLink = buildPartnerShortLink(slug);

  async function handleCopy() {
    if (!shortLink) return;
    await navigator.clipboard.writeText(shortLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (!shortLink) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        compact
          ? "admin-btn-secondary px-3 py-1.5 text-xs"
          : "shrink-0 rounded-xl border border-white/12 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/8"
      }
    >
      {copied ? "Скопировано" : compact ? "Копировать ссылку" : "Копировать"}
    </button>
  );
}
