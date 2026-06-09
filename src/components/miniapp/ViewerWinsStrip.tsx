"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { CroppedScreenshot } from "@/components/shared/CroppedScreenshot";
import { HomeSectionTitle } from "@/components/miniapp/HomeSectionTitle";
import {
  formatWinAmount,
  formatWinMultiplier,
  type CropRect,
} from "@/lib/image-crop";
import { resolveLogoUrl } from "@/lib/logo-url";
import {
  telegramDisplayName,
  telegramProfileUrl,
} from "@/lib/telegram-url";

export type ViewerWinItem = {
  id: string;
  screenshotUrl: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  telegramUsername?: string | null;
  telegramDisplayName?: string | null;
  winAmount?: string | null;
  winMultiplier?: string | null;
  isBigWin?: boolean;
  partner: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    logoLightUrl?: string | null;
    logoDarkUrl?: string | null;
    accentColor: string;
    affiliateUrl?: string | null;
  };
};

const GAP = 10;
const VISIBLE = 2;
const AUTO_MS = 8000;

type ViewerWinsStripProps = {
  wins: ViewerWinItem[];
};

function winCrop(win: ViewerWinItem): CropRect {
  return {
    x: win.cropX,
    y: win.cropY,
    w: win.cropWidth,
    h: win.cropHeight,
  };
}

export function ViewerWinsStrip({ wins }: ViewerWinsStripProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(180);
  const maxIndex = Math.max(0, wins.length - VISIBLE);
  const slideCount = maxIndex + 1;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const measure = () => {
      const card = el.querySelector<HTMLElement>(".viewer-win-card");
      if (!card) return;
      const track = el.querySelector<HTMLElement>(".viewer-wins-carousel-track");
      const gap = track
        ? Number.parseFloat(getComputedStyle(track).gap) || GAP
        : GAP;
      setStep(card.offsetWidth + gap);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [wins.length]);

  const scrollToIndex = useCallback(
    (next: number, smooth = true) => {
      scrollRef.current?.scrollTo({
        left: next * step,
        behavior: smooth ? "smooth" : "instant",
      });
    },
    [step],
  );

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(maxIndex, Math.max(0, next));
      setIndex(clamped);
      scrollToIndex(clamped);
    },
    [maxIndex, scrollToIndex],
  );

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    if (slideCount <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => {
        const next = current >= maxIndex ? 0 : current + 1;
        scrollToIndex(next);
        return next;
      });
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [slideCount, paused, maxIndex, scrollToIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let scrollTimer: number | undefined;

    const syncFromScroll = () => {
      const next = Math.min(
        maxIndex,
        Math.max(0, Math.round(el.scrollLeft / step)),
      );
      setIndex((prev) => (prev === next ? prev : next));
      setPaused(false);
    };

    const onScroll = () => {
      setPaused(true);
      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(syncFromScroll, 100);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", syncFromScroll);

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", syncFromScroll);
      if (scrollTimer) window.clearTimeout(scrollTimer);
    };
  }, [maxIndex, step]);

  function openTelegramProfile(e: React.MouseEvent, username: string) {
    e.preventDefault();
    e.stopPropagation();
    const url = telegramProfileUrl(username);
    if (!url) return;
    const tg = window.Telegram?.WebApp;
    if (tg) tg.openLink(url);
    else window.open(url, "_blank", "noopener,noreferrer");
  }

  function openPartnerDetail(slug: string) {
    router.push(`/partner/${slug}`);
  }

  function openAffiliate(e: React.MouseEvent, affiliateUrl?: string | null) {
    if (!affiliateUrl) return;
    e.preventDefault();
    e.stopPropagation();
    const tg = window.Telegram?.WebApp;
    if (tg) tg.openLink(affiliateUrl);
    else window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  }

  if (wins.length === 0) return null;

  return (
    <section className="viewer-wins-section overflow-visible pt-1 pb-1">
      <HomeSectionTitle icon={Trophy}>Заносы зрителей</HomeSectionTitle>

      <div
        ref={scrollRef}
        className="viewer-wins-carousel-viewport overflow-x-auto py-0.5"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
      >
        <div className="viewer-wins-carousel-track flex gap-2.5">
          {wins.map((win) => {
            const screenshotSrc = resolveLogoUrl(win.screenshotUrl);
            const crop = winCrop(win);
            const amount = formatWinAmount(win.winAmount);
            const multiplier = formatWinMultiplier(win.winMultiplier);
            const usernameLabel = win.telegramUsername
              ? telegramDisplayName(win.telegramUsername)
              : null;

            return (
              <article
                key={win.id}
                className={`viewer-win-card relative flex shrink-0 snap-start flex-col overflow-hidden${
                  win.isBigWin ? " viewer-win-card--big" : " viewer-win-card--regular"
                }`}
              >
                <div
                  className="viewer-win-card-link flex min-h-0 flex-1 cursor-pointer flex-col"
                  onClick={() => openPartnerDetail(win.partner.slug)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openPartnerDetail(win.partner.slug);
                    }
                  }}
                  role="link"
                  tabIndex={0}
                >
                  <div className="viewer-win-shot relative">
                    {screenshotSrc ? (
                      <CroppedScreenshot
                        src={screenshotSrc}
                        crop={crop}
                        alt="Занос зрителя"
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="flex aspect-[16/9] w-full items-center justify-center bg-[var(--surface-muted)] text-[10px] text-[var(--muted)]">
                        Скриншот
                      </div>
                    )}

                    {multiplier ? (
                      <div
                        className={`viewer-win-shot-multiplier${
                          win.isBigWin
                            ? " viewer-win-shot-multiplier--big"
                            : " viewer-win-shot-multiplier--regular"
                        }`}
                      >
                        <span>{multiplier}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="viewer-win-body flex flex-col gap-1 px-2.5 pb-1 pt-2">
                    {usernameLabel && win.telegramUsername ? (
                      <p className="viewer-win-caption min-w-0 truncate text-[11px] leading-tight">
                        <a
                          href={telegramProfileUrl(win.telegramUsername)}
                          onClick={(e) => openTelegramProfile(e, win.telegramUsername!)}
                          className="viewer-win-username font-normal"
                        >
                          {usernameLabel}
                        </a>
                        <span className="font-medium"> занёс</span>
                      </p>
                    ) : null}

                    {amount ? (
                      <p className="viewer-win-amount truncate font-extrabold tracking-tight">
                        {amount}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="px-2.5 pb-2 pt-0">
                  <a
                    href={win.partner.affiliateUrl ?? `/partner/${win.partner.slug}`}
                    onClick={(e) => openAffiliate(e, win.partner.affiliateUrl)}
                    className="viewer-win-go-btn btn-outline-gold btn-outline-gold-play flex w-full items-center justify-center rounded-full py-2"
                    title={`Перейти на ${win.partner.name}`}
                    draggable={false}
                  >
                    Перейти на {win.partner.name}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {slideCount > 1 ? (
        <div className="viewer-wins-dots" role="tablist" aria-label="Карусель заносов">
          {Array.from({ length: slideCount }, (_, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Слайд ${i + 1} из ${slideCount}`}
                className={`viewer-wins-dot ${active ? "viewer-wins-dot--active" : ""}`}
                onClick={() => goTo(i)}
              >
                {active ? (
                  <span
                    key={`progress-${index}`}
                    className={`viewer-wins-dot-fill ${paused ? "viewer-wins-dot-fill--paused" : ""}`}
                    style={{ animationDuration: `${AUTO_MS}ms` }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
