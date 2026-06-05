"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PartnerLogo } from "@/components/miniapp/PartnerLogo";

export type SearchPartner = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  accentColor: string;
};

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  placeholder: string;
  partners: SearchPartner[];
  initialQuery?: string;
};

export function SearchOverlay({
  open,
  onClose,
  placeholder,
  partners,
  initialQuery = "",
}: SearchOverlayProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((p) => p.name.toLowerCase().includes(q));
  }, [partners, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)]">
      <div className="px-4 pt-[calc(12px+var(--safe-top))] pb-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[var(--text)]">Поиск</h2>
            <span className="rounded-lg bg-[var(--accent)] px-2 py-0.5 text-xs font-extrabold text-[#131323]">
              {filtered.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="icon-btn flex h-10 w-10 items-center justify-center rounded-xl"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="input-field h-11 w-full rounded-[var(--radius-lg)] pr-4 pl-10 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((partner) => (
            <Link
              key={partner.id}
              href={`/partner/${partner.slug}`}
              onClick={onClose}
              className="surface-card flex h-[72px] items-center justify-center rounded-[var(--radius-lg)] p-3 transition active:scale-[0.98]"
            >
              <PartnerLogo
                name={partner.name}
                logoUrl={partner.logoUrl}
                logoLightUrl={partner.logoLightUrl}
                logoDarkUrl={partner.logoDarkUrl}
                accentColor={partner.accentColor}
                variant="compact"
                className="mx-auto object-center!"
              />
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--muted)]">
            Ничего не найдено
          </p>
        ) : null}
      </div>
    </div>
  );
}
