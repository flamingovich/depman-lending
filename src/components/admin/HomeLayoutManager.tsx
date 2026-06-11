"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BEST_BLOCK_LIMIT, HOME_BLOCK_LABELS } from "@/lib/home-blocks";
import { isChannelKind } from "@/lib/partner-kind";

export type LayoutPartner = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  inTopStrip: boolean;
  inBestBlock: boolean;
  topSortOrder: number;
  bestSortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  kind: string;
};

type LayoutState = {
  all: LayoutPartner[];
  top: LayoutPartner[];
  best: LayoutPartner[];
};

type HomeLayoutManagerProps = {
  partners: LayoutPartner[];
  pinnedPartnerId: string | null;
};

function buildLayoutState(partners: LayoutPartner[]): LayoutState {
  const regular = partners
    .filter((p) => !isChannelKind(p.kind))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    all: regular,
    top: regular
      .filter((p) => p.inTopStrip)
      .sort((a, b) => a.topSortOrder - b.topSortOrder),
    best: regular
      .filter((p) => p.inBestBlock)
      .sort((a, b) => a.bestSortOrder - b.bestSortOrder),
  };
}

function serializeLayout(state: LayoutState): LayoutPartner[] {
  const topIds = new Set(state.top.map((p) => p.id));
  const bestIds = new Set(state.best.map((p) => p.id));

  return state.all.map((partner, index) => ({
    ...partner,
    sortOrder: index,
    inTopStrip: topIds.has(partner.id),
    inBestBlock: bestIds.has(partner.id),
    topSortOrder: state.top.findIndex((p) => p.id === partner.id),
    bestSortOrder: state.best.findIndex((p) => p.id === partner.id),
  }));
}

export function HomeLayoutManager({
  partners,
  pinnedPartnerId,
}: HomeLayoutManagerProps) {
  const router = useRouter();
  const initial = useMemo(() => buildLayoutState(partners), [partners]);
  const [state, setState] = useState<LayoutState>(initial);
  const [pinnedId, setPinnedId] = useState(pinnedPartnerId ?? "");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isDirty = useMemo(() => {
    return (
      pinnedId !== (pinnedPartnerId ?? "") ||
      JSON.stringify(serializeLayout(state)) !==
        JSON.stringify(serializeLayout(initial))
    );
  }, [state, initial, pinnedId, pinnedPartnerId]);

  function addToTop(partnerId: string) {
    setState((prev) => {
      if (prev.top.some((p) => p.id === partnerId)) return prev;
      const partner = prev.all.find((p) => p.id === partnerId);
      if (!partner) return prev;
      setError(null);
      setSaved(false);
      return { ...prev, top: [...prev.top, partner] };
    });
  }

  function addToBest(partnerId: string) {
    setState((prev) => {
      if (prev.best.some((p) => p.id === partnerId)) return prev;
      if (prev.best.length >= BEST_BLOCK_LIMIT) {
        setError(`В блоке «Лучшие» максимум ${BEST_BLOCK_LIMIT} проекта`);
        return prev;
      }
      const partner = prev.all.find((p) => p.id === partnerId);
      if (!partner) return prev;
      setError(null);
      setSaved(false);
      return { ...prev, best: [...prev.best, partner] };
    });
  }

  function removeFromTop(partnerId: string) {
    setState((prev) => ({
      ...prev,
      top: prev.top.filter((p) => p.id !== partnerId),
    }));
    setSaved(false);
  }

  function removeFromBest(partnerId: string) {
    setState((prev) => ({
      ...prev,
      best: prev.best.filter((p) => p.id !== partnerId),
    }));
    setSaved(false);
  }

  function moveWithin(
    block: "all" | "top" | "best",
    partnerId: string,
    direction: -1 | 1,
  ) {
    setState((prev) => {
      const list = [...prev[block]];
      const index = list.findIndex((p) => p.id === partnerId);
      if (index < 0) return prev;
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      [list[index], list[target]] = [list[target], list[index]];
      setSaved(false);
      return { ...prev, [block]: list };
    });
  }

  function onDropTarget(target: "top" | "best") {
    if (!draggingId) return;
    if (target === "top") addToTop(draggingId);
    else addToBest(draggingId);
    setDraggingId(null);
  }

  async function saveLayout() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const items = serializeLayout(state).map((partner) => ({
        id: partner.id,
        sortOrder: partner.sortOrder,
        inTopStrip: partner.inTopStrip,
        inBestBlock: partner.inBestBlock,
        topSortOrder: partner.topSortOrder >= 0 ? partner.topSortOrder : 0,
        bestSortOrder: partner.bestSortOrder >= 0 ? partner.bestSortOrder : 0,
      }));

      const res = await fetch("/api/partners/home-layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Не удалось сохранить");
      }

      const settingsRes = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pinnedPartnerId: pinnedId || null,
        }),
      });

      if (!settingsRes.ok) {
        throw new Error("Не удалось сохранить закреплённый проект");
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  function renderList(
    block: "all" | "top" | "best",
    list: LayoutPartner[],
    options: { removable?: boolean; draggable?: boolean },
  ) {
    return (
      <ul className="space-y-2">
        {list.map((partner, index) => (
          <li
            key={partner.id}
            draggable={options.draggable !== false}
            onDragStart={() => setDraggingId(partner.id)}
            onDragEnd={() => setDraggingId(null)}
            className={`flex items-center gap-2 rounded-lg border bg-[#162236] px-2.5 py-2 ${
              draggingId === partner.id
                ? "border-violet-400 opacity-60"
                : "border-white/10"
            } ${!partner.isActive ? "opacity-50" : ""}`}
          >
            {options.draggable !== false ? (
              <span className="cursor-grab text-slate-500 active:cursor-grabbing">⋮⋮</span>
            ) : (
              <span className="w-3" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{partner.name}</p>
              <p className="truncate text-xs text-slate-400">/{partner.slug}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {options.removable ? (
                <button
                  type="button"
                  onClick={() =>
                    block === "top" ? removeFromTop(partner.id) : removeFromBest(partner.id)
                  }
                  className="rounded border border-white/10 px-1.5 text-xs text-slate-400"
                  aria-label="Убрать из блока"
                >
                  ×
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => moveWithin(block, partner.id, -1)}
                disabled={index === 0}
                className="rounded border border-white/10 px-1.5 text-xs disabled:opacity-30"
                aria-label="Выше"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveWithin(block, partner.id, 1)}
                disabled={index === list.length - 1}
                className="rounded border border-white/10 px-1.5 text-xs disabled:opacity-30"
                aria-label="Ниже"
              >
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="admin-card space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">Раскладка на главной</h2>
          <p className="text-sm text-slate-400">
            Все проекты всегда в общем списке. В «Сверху» и «Лучшие» — добавляйте
            перетаскиванием, не убирая из общего.
          </p>
        </div>
        <button
          type="button"
          onClick={saveLayout}
          disabled={!isDirty || saving}
          className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? "Сохранение…" : "Сохранить раскладку"}
        </button>
      </div>

      {error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      ) : null}
      {saved ? (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Раскладка сохранена
        </p>
      ) : null}

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-sm font-bold text-slate-100">Закреплённый проект</h3>
        <p className="mt-1 text-xs text-slate-400">
          Баннер сверху на главной: лого, бонусы, скрин на фоне и фото справа.
        </p>
        <label className="mt-3 block space-y-1">
          <span className="text-xs font-semibold text-slate-400">Проект</span>
          <select
            value={pinnedId}
            onChange={(e) => {
              setPinnedId(e.target.value);
              setSaved(false);
            }}
            className="admin-input"
          >
            <option value="">Не показывать</option>
            {state.all.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="min-h-[180px] rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-100">
              {HOME_BLOCK_LABELS.all}
            </h3>
            <span className="text-xs text-slate-400">всегда все</span>
          </div>
          {renderList("all", state.all, { removable: false, draggable: true })}
        </section>

        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDropTarget("top")}
          className="min-h-[180px] rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-3"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-100">
              {HOME_BLOCK_LABELS.top}
            </h3>
            <span className="text-xs text-slate-400">карусель</span>
          </div>
          {renderList("top", state.top, { removable: true })}
          {state.top.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">
              Перетащите сюда из «Все проекты»
            </p>
          ) : null}
        </section>

        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDropTarget("best")}
          className="min-h-[180px] rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-3"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-100">
              {HOME_BLOCK_LABELS.best}
            </h3>
            <span className="text-xs text-slate-400">
              {state.best.length}/{BEST_BLOCK_LIMIT}
            </span>
          </div>
          {renderList("best", state.best, { removable: true })}
          {state.best.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">
              Перетащите сюда из «Все проекты»
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
