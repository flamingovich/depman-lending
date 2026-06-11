"use client";

import { ScreenshotCropUploadField } from "@/components/admin/ScreenshotCropUploadField";
import { CroppedScreenshot } from "@/components/shared/CroppedScreenshot";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DEFAULT_CROP, formatWinAmount, formatWinMultiplier, type CropRect } from "@/lib/image-crop";
import { resolveLogoUrl } from "@/lib/logo-url";
import { telegramDisplayName } from "@/lib/telegram-url";

type PartnerOption = {
  id: string;
  name: string;
  slug: string;
};

type ViewerWinRow = {
  id: string;
  screenshotUrl: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  partnerId: string;
  telegramUserId: string;
  telegramUsername?: string | null;
  telegramDisplayName?: string | null;
  telegramPhotoUrl?: string | null;
  winAmount?: string | null;
  winMultiplier?: string | null;
  slotName?: string | null;
  sortOrder: number;
  isActive: boolean;
  isBigWin: boolean;
  partner: PartnerOption;
};

type ViewerWinForm = {
  screenshotUrl: string;
  crop: CropRect;
  partnerId: string;
  telegramDisplayName: string;
  telegramUsername: string;
  winAmount: string;
  winMultiplier: string;
  slotName: string;
  sortOrder: number;
  isActive: boolean;
  isBigWin: boolean;
};

type ViewerWinsManagerProps = {
  wins: ViewerWinRow[];
  partners: PartnerOption[];
};

const emptyForm = (partners: PartnerOption[]): ViewerWinForm => ({
  screenshotUrl: "",
  crop: DEFAULT_CROP,
  partnerId: partners[0]?.id ?? "",
  telegramDisplayName: "",
  telegramUsername: "",
  winAmount: "",
  winMultiplier: "",
  slotName: "",
  sortOrder: 0,
  isActive: true,
  isBigWin: false,
});

function rowCrop(win: ViewerWinRow): CropRect {
  return {
    x: win.cropX,
    y: win.cropY,
    w: win.cropWidth,
    h: win.cropHeight,
  };
}

export function ViewerWinsManager({ wins, partners }: ViewerWinsManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ViewerWinForm>(() => emptyForm(partners));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedWins = useMemo(
    () => [...wins].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
    [wins],
  );

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm(partners));
    setError(null);
  }

  function startEdit(win: ViewerWinRow) {
    setEditingId(win.id);
    setForm({
      screenshotUrl: win.screenshotUrl,
      crop: rowCrop(win),
      partnerId: win.partnerId,
      telegramDisplayName: win.telegramDisplayName ?? "",
      telegramUsername: win.telegramUsername ?? "",
      winAmount: win.winAmount ?? "",
      winMultiplier: win.winMultiplier?.replace(/^x/i, "") ?? "",
      slotName: win.slotName ?? "",
      sortOrder: win.sortOrder,
      isActive: win.isActive,
      isBigWin: win.isBigWin,
    });
    setError(null);
  }

  async function saveWin() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        screenshotUrl: form.screenshotUrl,
        cropX: form.crop.x,
        cropY: form.crop.y,
        cropWidth: form.crop.w,
        cropHeight: form.crop.h,
        partnerId: form.partnerId,
        telegramDisplayName: form.telegramDisplayName.trim(),
        telegramUsername: form.telegramUsername.trim(),
        winAmount: form.winAmount.trim(),
        winMultiplier: form.winMultiplier.trim(),
        slotName: form.slotName.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        isBigWin: form.isBigWin,
      };

      const res = await fetch(
        editingId ? `/api/viewer-wins/${editingId}` : "/api/viewer-wins",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Не удалось сохранить",
        );
      }

      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function deleteWin(id: string) {
    if (!window.confirm("Удалить этот занос?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/viewer-wins/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Не удалось удалить");
      if (editingId === id) resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  }

  async function moveWin(id: string, direction: -1 | 1) {
    const index = sortedWins.findIndex((win) => win.id === id);
    const target = sortedWins[index + direction];
    if (!target) return;

    setSaving(true);
    setError(null);
    try {
      const current = sortedWins[index];
      await Promise.all([
        fetch(`/api/viewer-wins/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: target.sortOrder }),
        }),
        fetch(`/api/viewer-wins/${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: current.sortOrder }),
        }),
      ]);
      router.refresh();
    } catch {
      setError("Не удалось изменить порядок");
    } finally {
      setSaving(false);
    }
  }

  if (partners.length === 0) {
    return (
      <p className="admin-card p-6 text-sm text-slate-400">
        Сначала добавьте хотя бы один проект в разделе «Проекты».
      </p>
    );
  }

  const canSave =
    form.screenshotUrl &&
    form.telegramDisplayName.trim() &&
    form.telegramUsername.trim() &&
    form.winAmount.trim() &&
    form.winMultiplier.trim();

  return (
    <div className="space-y-6">
      <div className="admin-card space-y-4 p-5">
        <div>
          <h2 className="text-lg font-bold">
            {editingId ? "Редактировать занос" : "Новый занос"}
          </h2>
          <p className="text-sm text-slate-400">
            Скриншот с кропом 16:9, проект, сумма выигрыша, имя и username зрителя
          </p>
        </div>

        <ScreenshotCropUploadField
          label="Скриншот заноса"
          hint="Выберите область кропа 16:9 — так скрин будет выглядеть в карусели."
          value={form.screenshotUrl}
          crop={form.crop}
          onChange={(url) => setForm({ ...form, screenshotUrl: url })}
          onCropChange={(crop) => setForm({ ...form, crop })}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Проект</span>
            <select
              value={form.partnerId}
              onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#162236] px-3 py-2"
            >
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Имя зрителя</span>
            <input
              value={form.telegramDisplayName}
              onChange={(e) =>
                setForm({ ...form, telegramDisplayName: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-[#162236] px-3 py-2"
              placeholder="Тимур"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Telegram username</span>
            <input
              value={form.telegramUsername}
              onChange={(e) => setForm({ ...form, telegramUsername: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#162236] px-3 py-2"
              placeholder="@ppgchz"
            />
            <span className="text-xs text-slate-500">
              По клику на @username откроется профиль в Telegram.
            </span>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Сумма выигрыша (₽)</span>
            <input
              value={form.winAmount}
              onChange={(e) => setForm({ ...form, winAmount: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#162236] px-3 py-2"
              placeholder="150 000"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Множитель (x)</span>
            <input
              value={form.winMultiplier}
              onChange={(e) =>
                setForm({ ...form, winMultiplier: e.target.value.replace(/[^\d.,]/g, "") })
              }
              className="w-full rounded-xl border border-white/10 bg-[#162236] px-3 py-2"
              placeholder="150"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Название слота</span>
            <input
              value={form.slotName}
              onChange={(e) => setForm({ ...form, slotName: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-[#162236] px-3 py-2"
              placeholder="Sweet Bonanza"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Порядок</span>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: Number(e.target.value) || 0 })
              }
              className="w-full rounded-xl border border-white/10 bg-[#162236] px-3 py-2"
            />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Показывать на главной
        </label>

        <label className="inline-flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.isBigWin}
            onChange={(e) => setForm({ ...form, isBigWin: e.target.checked })}
          />
          Жирный занос
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void saveWin()}
            disabled={saving || !canSave}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Сохранение..." : editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="admin-btn-secondary px-4 py-2 text-sm"
            >
              Отмена
            </button>
          ) : null}
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="admin-table-head">
            <tr>
              <th className="px-4 py-3 font-semibold">Скрин</th>
              <th className="px-4 py-3 font-semibold">Проект</th>
              <th className="px-4 py-3 font-semibold">Зритель</th>
              <th className="px-4 py-3 font-semibold">Выигрыш</th>
              <th className="px-4 py-3 font-semibold">Статус</th>
              <th className="px-4 py-3 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedWins.map((win, index) => {
              const preview = resolveLogoUrl(win.screenshotUrl);
              const multiplier = formatWinMultiplier(win.winMultiplier);
              const amount = formatWinAmount(win.winAmount);
              return (
                <tr key={win.id} className="border-b border-white/5">
                  <td className="px-4 py-3">
                    {preview ? (
                      <CroppedScreenshot
                        src={preview}
                        crop={rowCrop(win)}
                        className="h-14 w-24 rounded-lg"
                      />
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold">{win.partner.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      {win.telegramDisplayName ? (
                        <p className="truncate font-semibold">{win.telegramDisplayName}</p>
                      ) : null}
                      <p className="truncate text-xs text-slate-400">
                        {win.telegramUsername
                          ? telegramDisplayName(win.telegramUsername)
                          : "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {amount ? (
                      <div className="space-y-1">
                        <span className="font-semibold">
                          {amount}{multiplier ? ` / ${multiplier}` : ""}
                        </span>
                        {win.slotName?.trim() ? (
                          <p className="max-w-[160px] text-xs leading-snug text-slate-400">
                            {win.slotName.trim()}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {win.isActive ? (
                        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                          Активен
                        </span>
                      ) : (
                        <span className="rounded-md bg-white/8 px-2 py-0.5 text-xs font-semibold text-slate-400">
                          Скрыт
                        </span>
                      )}
                      {win.isBigWin ? (
                        <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-300">
                          Жирный
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(win)}
                        className="admin-btn-secondary px-3 py-1.5 text-xs"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveWin(win.id, -1)}
                        disabled={saving || index === 0}
                        className="admin-btn-secondary px-2 py-1.5 text-xs disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => void moveWin(win.id, 1)}
                        disabled={saving || index === sortedWins.length - 1}
                        className="admin-btn-secondary px-2 py-1.5 text-xs disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteWin(win.id)}
                        disabled={saving}
                        className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedWins.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">
            Пока нет заносов. Добавьте первый через форму выше.
          </p>
        ) : null}
      </div>
    </div>
  );
}
