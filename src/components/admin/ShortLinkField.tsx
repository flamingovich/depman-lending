"use client";

import { buildPartnerShortLink } from "@/lib/short-link";
import { useMemo, useState } from "react";

type ShortLinkFieldProps = {
  slug: string;
};

export function ShortLinkField({ slug }: ShortLinkFieldProps) {
  const [copied, setCopied] = useState(false);
  const shortLink = useMemo(() => buildPartnerShortLink(slug), [slug]);

  async function handleCopy() {
    if (!shortLink) return;
    await navigator.clipboard.writeText(shortLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1 md:col-span-2">
      <span className="text-sm font-semibold">Короткая ссылка для рассылки</span>
      <p className="text-xs text-slate-400">
        Ведёт на партнёрскую ссылку. На сайте кнопки «Играть» открывают её напрямую.
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={shortLink}
          placeholder="Укажите slug, например beef"
          className="admin-input flex-1 text-slate-300"
        />
        <button
          type="button"
          onClick={handleCopy}
          disabled={!shortLink}
          className="shrink-0 rounded-xl border border-white/12 px-4 py-2 text-sm font-semibold text-slate-200 disabled:opacity-40"
        >
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
    </div>
  );
}
