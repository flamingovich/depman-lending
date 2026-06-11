"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PartnerLogo } from "@/components/miniapp/PartnerLogo";
import { useCarouselTouchScroll } from "@/lib/use-carousel-touch-scroll";

export type StripPartner = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  accentColor: string;
  bonusValue?: string | null;
  badge?: string | null;
};

const GAP = 10;
const VISIBLE = 3;
const AUTO_MS = 5000;

export function NewBonusesStrip({ partners }: { partners: StripPartner[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useCarouselTouchScroll(scrollRef);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(110);
  const maxIndex = Math.max(0, partners.length - VISIBLE);
  const slideCount = maxIndex + 1;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const measure = () => {
      const card = el.querySelector<HTMLElement>(".new-bonus-card");
      if (!card) return;
      const track = el.querySelector<HTMLElement>(".new-bonus-carousel-track");
      const gap = track
        ? Number.parseFloat(getComputedStyle(track).gap) || GAP
        : GAP;
      setStep(card.offsetWidth + gap);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [partners.length]);

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

  if (partners.length === 0) return null;

  return (
    <section className="overflow-visible pt-1 pb-1">
      <div
        ref={scrollRef}
        className="new-bonus-carousel-viewport overflow-x-auto py-0.5"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
      >
        <div className="new-bonus-carousel-track flex gap-2.5">
          {partners.map((partner) => (
            <Link
              key={partner.id}
              href={`/partner/${partner.slug}`}
              draggable={false}
              className="new-bonus-card relative flex shrink-0 snap-start flex-col items-center px-1.5 py-2 active:scale-[0.98]"
            >
              {partner.badge?.trim() ? (
                <span className="chip-new">{partner.badge.trim()}</span>
              ) : null}

              <div className="new-bonus-content flex flex-col items-center justify-center gap-0.5">
                <PartnerLogo
                  name={partner.name}
                  logoUrl={partner.logoUrl}
                  logoLightUrl={partner.logoLightUrl}
                  logoDarkUrl={partner.logoDarkUrl}
                  accentColor={partner.accentColor}
                  variant="strip"
                />
                <p className="new-bonus-text line-clamp-2 text-center text-[10px] leading-[1.15] tracking-tight">
                  {partner.bonusValue ?? "Бонус"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {slideCount > 1 ? (
        <div className="new-bonus-dots" role="tablist" aria-label="Карусель бонусов">
          {Array.from({ length: slideCount }, (_, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Слайд ${i + 1} из ${slideCount}`}
                className={`new-bonus-dot ${active ? "new-bonus-dot--active" : ""}`}
                onClick={() => goTo(i)}
              >
                {active ? (
                  <span
                    key={`progress-${index}`}
                    className={`new-bonus-dot-fill ${paused ? "new-bonus-dot-fill--paused" : ""}`}
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
