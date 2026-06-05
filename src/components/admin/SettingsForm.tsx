"use client";

import { useState } from "react";

type Settings = {
  siteName: string;
  siteTagline: string;
  heroTitle: string;
  searchPlaceholder: string;
  promoBannerText: string;
  promoButtonText: string;
  bottomBarTitle: string;
  bottomBarRating: number;
  bottomBarCtaText: string;
  telegramBotUrl: string | null;
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    setMessage(res.ok ? "Сохранено" : "Ошибка сохранения");
  }

  const fields: { key: keyof Settings; label: string; type?: string }[] = [
    { key: "siteName", label: "Название бренда" },
    { key: "siteTagline", label: "Подзаголовок" },
    { key: "heroTitle", label: "Заголовок на главной" },
    { key: "searchPlaceholder", label: "Плейсхолдер поиска" },
    { key: "promoBannerText", label: "Текст промо-баннера" },
    { key: "promoButtonText", label: "Текст кнопки промо" },
    { key: "bottomBarTitle", label: "Нижняя панель — заголовок" },
    { key: "bottomBarCtaText", label: "Нижняя панель — кнопка" },
    { key: "telegramBotUrl", label: "Ссылка на бота (https://t.me/...)" },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        {fields.map(({ key, label }) => (
          <label key={key} className="block space-y-1">
            <span className="text-sm font-semibold">{label}</span>
            <input
              value={String(form[key] ?? "")}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value || null })
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
        ))}

        <label className="block space-y-1">
          <span className="text-sm font-semibold">Рейтинг в нижней панели</span>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.bottomBarRating}
            onChange={(e) =>
              setForm({
                ...form,
                bottomBarRating: Number(e.target.value),
              })
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      {message ? (
        <p className={`text-sm ${message === "Сохранено" ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {loading ? "Сохранение..." : "Сохранить настройки"}
      </button>
    </form>
  );
}
