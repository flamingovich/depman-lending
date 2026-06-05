"use client";

import { LogoUploadField } from "@/components/admin/LogoUploadField";
import { PartnerCardPreview } from "@/components/admin/PartnerCardPreview";
import { ShortLinkField } from "@/components/admin/ShortLinkField";
import { buildPartnerPayload } from "@/lib/partner-payload";
import type { BonusInput, PartnerFormData } from "@/lib/partner-types";
import { isChannelKind, PARTNER_KINDS } from "@/lib/partner-kind";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { parseFeatures, slugify } from "@/lib/utils";

export type { BonusInput, PartnerFormData };

type PartnerFormProps = {
  initial: PartnerFormData;
  mode: "create" | "edit";
};

export function PartnerForm({ initial, mode }: PartnerFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [featuresText, setFeaturesText] = useState(
    parseFeatures(initial.features).join("\n"),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoPrefix = slugify(form.slug || form.name || "partner");
  const isChannel = isChannelKind(form.kind);

  const previewPartner = useMemo(
    () => ({
      id: form.id ?? "preview",
      slug: form.slug?.trim() || slugify(form.name || "preview"),
      name: form.name || "Название проекта",
      logoUrl: form.logoUrl || null,
      logoLightUrl: form.logoLightUrl || null,
      logoDarkUrl: form.logoDarkUrl || null,
      accentColor: form.accentColor,
      rating: form.rating,
      features: JSON.stringify(
        featuresText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      ),
      promoCode: form.promoCode || null,
      bonus1Label: form.bonus1Label || null,
      bonus1Value: form.bonus1Value || null,
      bonus2Label: form.bonus2Label || null,
      bonus2Value: form.bonus2Value || null,
      ctaText: form.ctaText || "Забрать бонусы",
      affiliateUrl: form.affiliateUrl || null,
      cardLayout: form.cardLayout,
      bonusValue: form.bonuses[0]?.value || form.bonuses[0]?.title || null,
    }),
    [form, featuresText],
  );

  function updateBonus(index: number, patch: Partial<BonusInput>) {
    setForm((prev) => ({
      ...prev,
      bonuses: prev.bonuses.map((bonus, i) =>
        i === index ? { ...bonus, ...patch } : bonus,
      ),
    }));
  }

  function addBonus() {
    setForm((prev) => ({
      ...prev,
      bonuses: [...prev.bonuses, { title: "", value: "", description: "" }],
    }));
  }

  function removeBonus(index: number) {
    setForm((prev) => ({
      ...prev,
      bonuses: prev.bonuses.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = buildPartnerPayload(form, featuresText);

    const url =
      mode === "create" ? "/api/partners" : `/api/partners/${form.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Не удалось сохранить. Проверьте данные.");
      return;
    }

    router.push("/admin/partners");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="admin-card grid gap-4 p-5 md:grid-cols-2">
          <label className="block space-y-1 md:col-span-2">
            <span className="text-sm font-semibold">Тип</span>
            <select
              value={form.kind ?? PARTNER_KINDS.casino}
              onChange={(e) => {
                const nextKind = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  kind: nextKind,
                  isFeatured: isChannelKind(nextKind) ? prev.isFeatured : false,
                  ctaText: isChannelKind(nextKind)
                    ? prev.ctaText || "Смотреть"
                    : prev.ctaText || "Забрать бонусы",
                }));
              }}
              className="admin-input"
            >
              <option value={PARTNER_KINDS.casino}>Казино / партнёр</option>
              <option value={PARTNER_KINDS.channel}>
                Промо-канал (баннер сверху, не в каталоге)
              </option>
            </select>
          </label>

          <label className="block space-y-1 md:col-span-2">
            <span className="text-sm font-semibold">Название *</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="admin-input"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Slug (URL)</span>
            <input
              value={form.slug ?? ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="admin-input"
              placeholder="beef"
            />
            <span className="text-xs text-slate-400">
              Страница: /partner/beef · короткая ссылка: depman.vip/beef
            </span>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Бейдж</span>
            <input
              value={form.badge ?? ""}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="admin-input"
              placeholder="HOT, NEW..."
            />
          </label>

          <label className="block space-y-1 md:col-span-2">
            <span className="text-sm font-semibold">Описание</span>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="admin-input"
            />
          </label>

          <LogoUploadField
            label="Логотип для светлой темы (PNG, тёмный, без фона)"
            hint="Прозрачный PNG для светлой темы приложения."
            value={form.logoLightUrl ?? ""}
            onChange={(url) => setForm({ ...form, logoLightUrl: url })}
            uploadPrefix={`${logoPrefix}-light`}
            previewTheme="light"
          />

          <LogoUploadField
            label="Логотип для тёмной темы (PNG, белый, без фона)"
            hint="Прозрачный PNG для тёмной темы приложения."
            value={form.logoDarkUrl ?? ""}
            onChange={(url) => setForm({ ...form, logoDarkUrl: url })}
            uploadPrefix={`${logoPrefix}-dark`}
            previewTheme="dark"
          />

          <LogoUploadField
            label="Логотип запасной (если не указаны варианты для тем)"
            value={form.logoUrl ?? ""}
            onChange={(url) => setForm({ ...form, logoUrl: url })}
            uploadPrefix={`${logoPrefix}-fallback`}
            previewTheme="light"
          />

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Рейтинг</span>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) =>
                setForm({ ...form, rating: Number(e.target.value) })
              }
              className="admin-input"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Цвет акцента</span>
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) =>
                setForm({ ...form, accentColor: e.target.value })
              }
              className="h-11 w-full rounded-xl border border-white/12 bg-[#162236] px-2 py-1"
            />
          </label>

          <label className="block space-y-1 md:col-span-2">
            <span className="text-sm font-semibold">Партнёрская ссылка</span>
            <input
              value={form.affiliateUrl ?? ""}
              onChange={(e) =>
                setForm({ ...form, affiliateUrl: e.target.value })
              }
              className="admin-input"
              placeholder="https://beefway66.com/c22082169"
            />
          </label>

          <ShortLinkField slug={form.slug ?? ""} />

          {!isChannel ? (
            <div className="space-y-3 md:col-span-2">
            <h3 className="text-sm font-extrabold text-white">
              Блок бонусов на карточке
            </h3>
            <p className="text-xs text-slate-400">
              Два настраиваемых бонуса и промокод последней строкой.
            </p>

            <div className="admin-card-muted grid gap-3 p-4 md:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-400">
                  Бонус 1 — подпись
                </span>
                <input
                  value={form.bonus1Label ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, bonus1Label: e.target.value })
                  }
                  className="admin-input text-sm"
                  placeholder="Бонус за регистрацию"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-400">
                  Бонус 1 — значение
                </span>
                <input
                  value={form.bonus1Value ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, bonus1Value: e.target.value })
                  }
                  className="admin-input text-sm"
                  placeholder="100 FS"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-400">
                  Бонус 2 — подпись
                </span>
                <input
                  value={form.bonus2Label ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, bonus2Label: e.target.value })
                  }
                  className="admin-input text-sm"
                  placeholder="Бонус за депозит"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-400">
                  Бонус 2 — значение
                </span>
                <input
                  value={form.bonus2Value ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, bonus2Value: e.target.value })
                  }
                  className="admin-input text-sm"
                  placeholder="до 500 FS + 225%"
                />
              </label>
              <label className="block space-y-1 md:col-span-2">
                <span className="text-xs font-semibold text-slate-400">
                  Промокод
                </span>
                <input
                  value={form.promoCode ?? ""}
                  onChange={(e) => setForm({ ...form, promoCode: e.target.value })}
                  className="admin-input text-sm"
                  placeholder="DEPMAN"
                />
              </label>
            </div>
          </div>
          ) : null}

          {!isChannel ? (
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Тип карточки</span>
            <select
              value={form.cardLayout}
              onChange={(e) => setForm({ ...form, cardLayout: e.target.value })}
              className="admin-input"
            >
              <option value="grid">Крупная (каталог)</option>
              <option value="compact">Компактная (список)</option>
            </select>
          </label>
          ) : null}

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Текст кнопки</span>
            <input
              value={form.ctaText}
              onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
              className="admin-input"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Порядок сортировки</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: Number(e.target.value) })
              }
              className="admin-input"
            />
          </label>

          <label className="block space-y-1 md:col-span-2">
            <span className="text-sm font-semibold">
              Преимущества (по одному на строку)
            </span>
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={4}
              className="admin-input"
            />
          </label>

          {isChannel ? (
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm({ ...form, isFeatured: e.target.checked })
                }
              />
              <span className="text-sm font-semibold">
                Показывать промо-баннер на главной
              </span>
            </label>
          ) : null}

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span className="text-sm font-semibold">
              {isChannel ? "Активен" : "Показывать в каталоге"}
            </span>
          </label>
        </section>

        {!isChannel ? (
        <section className="admin-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold">Бонусы</h2>
            <button
              type="button"
              onClick={addBonus}
              className="rounded-xl bg-white/8 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/12"
            >
              + Добавить бонус
            </button>
          </div>

          <div className="space-y-4">
            {form.bonuses.map((bonus, index) => (
              <div
                key={index}
                className="admin-card-muted grid gap-3 p-4 md:grid-cols-3"
              >
                <input
                  placeholder="Стартовый Пакет"
                  value={bonus.title}
                  onChange={(e) => updateBonus(index, { title: e.target.value })}
                  className="admin-input md:col-span-1"
                />
                <input
                  placeholder="до 600 FS + 225%"
                  value={bonus.value ?? ""}
                  onChange={(e) => updateBonus(index, { value: e.target.value })}
                  className="admin-input"
                />
                <div className="flex gap-2 md:col-span-1">
                  <input
                    placeholder="Описание"
                    value={bonus.description ?? ""}
                    onChange={(e) =>
                      updateBonus(index, { description: e.target.value })
                    }
                    className="admin-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeBonus(index)}
                    className="rounded-xl border border-red-500/30 px-3 text-sm text-red-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>

      <aside className="xl:sticky xl:top-4 xl:self-start">
        <PartnerCardPreview partner={previewPartner} />
      </aside>
    </form>
  );
}
