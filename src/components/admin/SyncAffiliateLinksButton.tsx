"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

type SyncResult = {
  updated: number;
  skipped: number;
  missing: number;
  error?: string;
};

export function SyncAffiliateLinksButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runSync() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/sync-affiliate-links", {
        method: "POST",
      });
      const data = (await res.json()) as SyncResult;
      if (!res.ok) {
        setMessage(data.error || "Ошибка синхронизации");
        return;
      }
      setMessage(
        `Обновлено: ${data.updated}, без изменений: ${data.skipped}, не найдено в API: ${data.missing}`,
      );
      if (data.updated > 0) {
        window.location.reload();
      }
    } catch {
      setMessage("Не удалось выполнить синхронизацию");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={runSync}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
      >
        <RefreshCw
          className={`size-4 ${loading ? "animate-spin" : ""}`}
          aria-hidden
        />
        {loading ? "Синхронизация…" : "Синхронизировать ссылки"}
      </button>
      {message ? (
        <p className="max-w-xs text-right text-xs text-slate-400">{message}</p>
      ) : null}
    </div>
  );
}
