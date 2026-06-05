"use client";

import { Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ReviewModalProps = {
  open: boolean;
  partnerName: string;
  partnerId: string;
  onClose: () => void;
  onSubmitted?: () => void;
};

export function ReviewModal({
  open,
  partnerName,
  partnerId,
  onClose,
  onSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setRating(5);
    setHoverRating(0);
    setAuthorName("");
    setText("");
    setError(null);
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 3) {
      setError("Напишите отзыв хотя бы из 3 символов");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/partners/${partnerId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating,
        text: text.trim(),
        authorName: authorName.trim() || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Не удалось отправить отзыв");
      return;
    }

    onSubmitted?.();
    onClose();
  }

  const activeRating = hoverRating || rating;

  return createPortal(
    <div
      className="review-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="review-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2
            id="review-modal-title"
            className="text-sm font-extrabold text-[var(--text)]"
          >
            Отзыв — {partnerName}
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-[var(--muted)]">
              Ваша оценка
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="review-star-btn"
                  aria-label={`Оценка ${value}`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      value <= activeRating
                        ? "fill-[var(--accent)] text-[var(--accent)]"
                        : "text-[var(--border)]"
                    }`}
                    strokeWidth={0}
                  />
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Имя (необязательно)
            </span>
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Гость"
              className="input-field h-10 w-full rounded-[var(--radius-md)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Отзыв
            </span>
            <textarea
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Расскажите о своём опыте..."
              className="input-field w-full resize-none rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </label>

          {error ? <p className="text-xs text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="btn-outline-gold flex w-full items-center justify-center rounded-full py-2.5 text-xs font-bold disabled:opacity-60"
          >
            {loading ? "Отправка..." : "Отправить отзыв"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
