"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
export type SubmitWinPartnerOption = {
  id: string;
  name: string;
};

type SubmitViewerWinModalProps = {
  open: boolean;
  onClose: () => void;
  partners: SubmitWinPartnerOption[];
};

export function SubmitViewerWinModal({
  open,
  onClose,
  partners,
}: SubmitViewerWinModalProps) {
  const [contact, setContact] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [slotName, setSlotName] = useState("");
  const [winDate, setWinDate] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    setContact("");
    setPartnerId(partners[0]?.id ?? "");
    setSlotName("");
    setWinDate("");
    setScreenshot(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, partners]);

  useEffect(() => {
    if (!screenshot) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(screenshot);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  if (!open || !mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) {
      setError("Укажите Telegram @username или номер");
      return;
    }
    if (!partnerId) {
      setError("Выберите проект");
      return;
    }
    if (!winDate.trim()) {
      setError("Укажите дату заноса");
      return;
    }
    if (!slotName.trim()) {
      setError("Укажите название слота");
      return;
    }
    if (!screenshot) {
      setError("Прикрепите скрин заноса");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("contact", contact.trim());
    formData.append("partnerId", partnerId);
    formData.append("winDate", winDate.trim());
    formData.append("slotName", slotName.trim());
    formData.append("screenshot", screenshot);

    const res = await fetch("/api/viewer-wins/submit", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Не удалось отправить занос");
      return;
    }

    setSuccess(true);
  }

  return createPortal(
    <div
      className="review-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="review-modal submit-win-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-win-modal-title"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2
            id="submit-win-modal-title"
            className="text-sm font-extrabold text-[var(--text)]"
          >
            Отправить занос
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="icon-btn flex h-8 w-8 items-center justify-center rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-[11px] leading-snug text-[var(--muted)]">
          Стань участником конкурса за лучший занос месяца и получи денежный приз $100.
        </p>

        {success ? (
          <div className="space-y-3 py-2">
            <p className="text-sm font-semibold text-[var(--text)]">
              Занос отправлен!
            </p>
            <p className="text-xs text-[var(--muted)]">
              Мы свяжемся с вами в Telegram, если ваш занос победит в конкурсе.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-gold flex w-full items-center justify-center rounded-full py-2.5 text-xs font-bold"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Telegram @username или номер
              </span>
              <input
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="@username или +7..."
                className="input-field h-10 w-full rounded-[var(--radius-md)] px-3 text-sm outline-none focus:border-[var(--accent)]"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Проект
              </span>
              <select
                required
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="input-field h-10 w-full rounded-[var(--radius-md)] px-3 text-sm outline-none focus:border-[var(--accent)]"
              >
                <option value="" disabled>
                  Выберите проект
                </option>
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Дата заноса
              </span>
              <input
                required
                type="date"
                value={winDate}
                onChange={(e) => setWinDate(e.target.value)}
                className="input-field h-10 w-full rounded-[var(--radius-md)] px-3 text-sm outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--muted)]">
                Можно указать примерную дату
              </span>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Название слота
              </span>
              <input
                required
                value={slotName}
                onChange={(e) => setSlotName(e.target.value)}
                placeholder="Sweet Bonanza"
                className="input-field h-10 w-full rounded-[var(--radius-md)] px-3 text-sm outline-none focus:border-[var(--accent)]"
              />
            </label>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[var(--muted)]">
                Скрин заноса
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setScreenshot(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="submit-win-upload flex w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 py-4 text-center"
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Превью скрина"
                    className="max-h-28 w-full rounded-md object-contain"
                  />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 text-[var(--accent)]" />
                    <span className="text-xs font-semibold text-[var(--text)]">
                      Выбери скрин заноса
                    </span>
                  </>
                )}
              </button>
            </div>

            {error ? <p className="text-xs text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="btn-outline-gold flex w-full items-center justify-center rounded-full py-2.5 text-xs font-bold disabled:opacity-60"
            >
              {loading ? "Отправка..." : "Отправить"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
