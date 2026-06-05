"use client";

import { useMemo, useState } from "react";
import {
  CasinoGridCard,
  type GridPartner,
} from "@/components/miniapp/CasinoGridCard";
import { CompactPartnerCard } from "@/components/miniapp/CompactPartnerCard";
import { parseFeatures } from "@/lib/utils";

type PartnerCardPreviewProps = {
  partner: GridPartner & {
    cardLayout: string;
    bonusValue?: string | null;
  };
};

export function PartnerCardPreview({ partner }: PartnerCardPreviewProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const featuresJson = useMemo(() => {
    if (typeof partner.features === "string") return partner.features;
    return JSON.stringify(parseFeatures(String(partner.features)));
  }, [partner.features]);

  const previewPartner = { ...partner, features: featuresJson };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-slate-900">Предпросмотр</h2>
        <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`rounded-md px-2.5 py-1 ${
              theme === "dark"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Тёмная
          </button>
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`rounded-md px-2.5 py-1 ${
              theme === "light"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Светлая
          </button>
        </div>
      </div>

      <div
        data-theme={theme}
        className="tma-shell tma-shell--static overflow-hidden rounded-xl border border-slate-200 bg-[var(--bg)] py-2"
      >
        {partner.cardLayout === "compact" ? (
          <div className="px-3">
            <CompactPartnerCard partner={previewPartner} preview />
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-2 px-3">
            <CasinoGridCard partner={previewPartner} preview />
          </section>
        )}
      </div>
    </div>
  );
}
