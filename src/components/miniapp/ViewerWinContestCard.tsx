"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatCountdown,
  getCountdownParts,
  getCurrentMonthEnd,
} from "@/lib/month-end-countdown";

type ViewerWinContestCardProps = {
  onSubmitClick: () => void;
};

export function ViewerWinContestCard({ onSubmitClick }: ViewerWinContestCardProps) {
  const monthEnd = useMemo(() => getCurrentMonthEnd(), []);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const tick = () => {
      setCountdown(formatCountdown(getCountdownParts(monthEnd)));
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [monthEnd]);

  return (
    <article className="viewer-win-card viewer-win-card--contest relative flex shrink-0 snap-start flex-col overflow-hidden">
      <div className="viewer-win-contest-header">
        <span className="viewer-win-contest-header-text">Конкурс месяца</span>
      </div>

      <div className="viewer-win-contest-main">
        <div className="viewer-win-contest-timer" aria-live="polite">
          {countdown}
        </div>

        <div className="viewer-win-contest-copy">
          <p className="viewer-win-contest-subtitle">
            Лучший занос месяца получит приз
          </p>
          <div className="viewer-win-contest-prize" aria-label="$100">
            $100
          </div>
        </div>
      </div>

      <div className="px-2.5 pb-2 pt-0">
        <button
          type="button"
          onClick={onSubmitClick}
          className="viewer-win-action-btn viewer-win-contest-btn rounded-full"
        >
          Отправить занос
        </button>
      </div>
    </article>
  );
}
