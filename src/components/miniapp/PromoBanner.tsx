"use client";

type PromoBannerProps = {
  title: string;
  description: string;
  buttonText: string;
};

export function PromoBanner({ title, description, buttonText }: PromoBannerProps) {
  return (
    <div
      className="mx-4 overflow-hidden rounded-2xl p-3.5 text-white card-shadow"
      style={{
        background: `linear-gradient(135deg, var(--promo-from) 0%, var(--promo-to) 100%)`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold tracking-tight">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] font-medium text-white/85">
            {description}
          </p>
        </div>
        <button
          type="button"
          className="btn-accent shrink-0 rounded-xl px-4 py-2 text-xs"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
