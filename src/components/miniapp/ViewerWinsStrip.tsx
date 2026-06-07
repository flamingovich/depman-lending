"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { CroppedScreenshot } from "@/components/shared/CroppedScreenshot";
import { HomeSectionTitle } from "@/components/miniapp/HomeSectionTitle";
import { PartnerLogo } from "@/components/miniapp/PartnerLogo";
import {
  formatWinAmount,
  formatWinMultiplier,
  type CropRect,
} from "@/lib/image-crop";
import { resolveLogoUrl } from "@/lib/logo-url";
import {
  telegramContactUrl,
  telegramDisplayName,
} from "@/lib/telegram-url";

export type ViewerWinItem = {
  id: string;
  screenshotUrl: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  telegramUserId: string;
  telegramUsername?: string | null;
  telegramDisplayName?: string | null;
  telegramPhotoUrl?: string | null;
  winAmount?: string | null;
  winMultiplier?: string | null;
  partner: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    logoLightUrl?: string | null;
    logoDarkUrl?: string | null;
    accentColor: string;
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

  function openTelegram(
    e: React.MouseEvent,
    userId: string,
    username?: string | null,
  ) {
    e.preventDefault();
    e.stopPropagation();
    const url = telegramContactUrl(userId, username);
    if (!url) return;
    const tg = window.Telegram?.WebApp;
    if (tg) tg.openLink(url);
    else window.open(url, "_blank", "noopener,noreferrer");
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
            const avatarSrc = win.telegramPhotoUrl
              ? resolveLogoUrl(win.telegramPhotoUrl) ?? win.telegramPhotoUrl
              : null;
            const crop = winCrop(win);
            const amount = formatWinAmount(win.winAmount);
            const multiplier = formatWinMultiplier(win.winMultiplier);
            const usernameLabel = win.telegramUsername
              ? telegramDisplayName(win.telegramUsername)
              : null;

            return (
              <article
                key={win.id}
                className="viewer-win-card relative flex shrink-0 snap-start flex-col overflow-hidden"
              >
                <div className="viewer-win-shot relative">
                  {screenshotSrc ? (
                    <CroppedScreenshot
                      src={screenshotSrc}
                      crop={crop}
                      alt="Занос зрителя"
                      className="h-full w-full"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex aspect-[16/9] w-full items-center justify-center bg-[var(--surface-muted)] text-[10px] text-[var(--muted)]">
                      Скриншот
                    </div>
                  )}

                  <div aria-hidden className="viewer-win-shot-glow pointer-events-none" />

                  <div className="viewer-win-shot-bar absolute left-0 top-0 z-[2]">
                    <div className="viewer-win-shot-logo relative min-w-0">
                      <PartnerLogo
                        name={win.partner.name}
                        logoUrl={win.partner.logoUrl}
                        logoLightUrl={win.partner.logoLightUrl}
                        logoDarkUrl={win.partner.logoDarkUrl}
                        accentColor={win.partner.accentColor}
                        variant="strip"
                        forceTheme="dark"
                      />
                    </div>
                  </div>
                </div>

                <div className="viewer-win-body flex flex-col gap-2.5 p-2.5">
                  <button
                    type="button"
                    onClick={(e) =>
                      openTelegram(e, win.telegramUserId, win.telegramUsername)
                    }
                    className="viewer-win-telegram flex min-w-0 items-start gap-2 text-left"
                  >
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt=""
                        width={28}
                        height={28}
                        className="viewer-win-avatar h-7 w-7 shrink-0 rounded-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <span className="viewer-win-avatar flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--muted)]">
                        ?
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      {win.telegramDisplayName ? (
                        <span className="block truncate text-xs font-semibold leading-tight text-[var(--text)]">
                          {win.telegramDisplayName}
                        </span>
                      ) : null}
                      {usernameLabel ? (
                        <span className="block truncate text-[11px] font-bold leading-tight text-[var(--accent-dark)]">
                          {usernameLabel}
                        </span>
                      ) : null}
                    </span>
                  </button>

                  {amount || multiplier ? (
                    <p className="viewer-win-payout truncate text-xs font-extrabold tracking-tight text-[var(--text)]">
                      {amount ? <span>{amount}</span> : null}
                      {amount && multiplier ? (
                        <span className="mx-1.5 font-semibold text-[var(--muted)]">/</span>
                      ) : null}
                      {multiplier ? (
                        <span className="text-[var(--accent-dark)]">{multiplier}</span>
                      ) : null}
                    </p>
                  ) : null}

                  <Link
                    href={`/partner/${win.partner.slug}`}
                    className="viewer-win-go-btn btn-outline-gold btn-outline-gold-play mt-auto flex w-full items-center justify-center rounded-full py-2"
                    title={`Перейти на ${win.partner.name}`}
                    draggable={false}
                  >
                    Перейти на {win.partner.name}
                  </Link>
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
