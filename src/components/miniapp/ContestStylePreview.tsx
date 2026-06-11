"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatCountdown,
  getCountdownParts,
  getCurrentMonthEnd,
} from "@/lib/month-end-countdown";

const STYLES = [
  {
    id: "neutral-gold",
    title: "1. Нейтральный + золото",
    hint: "Как обычные карточки, золото только на акцентах. Рекомендую.",
  },
  {
    id: "navy-premium",
    title: "2. Тёмно-синий премиум",
    hint: "Глубокий navy в палитре сайта, золотая рамка.",
  },
  {
    id: "purple",
    title: "3. Фиолетовый акцент",
    hint: "Отличает конкурс от заносов, без зелёного/оранжевого.",
  },
  {
    id: "orange",
    title: "4. Оранжевый (текущий)",
    hint: "То, что сейчас на главной.",
  },
  {
    id: "green",
    title: "5. Зелёный",
    hint: "Вариант «деньги / купюра».",
  },
  {
    id: "gold-border",
    title: "6. Золотая рамка",
    hint: "Как жирный занос: нейтральный фон, золотой контур.",
  },
  {
    id: "minimal",
    title: "7. Минимализм",
    hint: "Почти без цвета — только типографика и тонкие линии.",
  },
  {
    id: "glass",
    title: "8. Стекло",
    hint: "Полупрозрачные блоки, лёгкий blur.",
  },
  {
    id: "red-casino",
    title: "9. Казино-красный",
    hint: "Тёплый красный акцент, как на промо-блоках.",
  },
  {
    id: "teal",
    title: "10. Бирюзовый",
    hint: "Холодный акцент, не зелёный и не оранжевый.",
  },
  {
    id: "monochrome",
    title: "11. Монохром",
    hint: "Ч/б и серый, максимально сдержанно.",
  },
  {
    id: "gold-bar",
    title: "12. Золотая шапка",
    hint: "Яркая золотая полоса сверху, остальное нейтральное.",
  },
  {
    id: "gradient-night",
    title: "13. Ночной градиент",
    hint: "Фиолетово-синий закат, золото на тексте.",
  },
  {
    id: "outline",
    title: "14. Только контур",
    hint: "Прозрачный фон, золотые outline-элементы.",
  },
  {
    id: "sky-blue",
    title: "15. Голубой",
    hint: "Светлый голубой акцент, свежий и чистый.",
  },
  {
    id: "blue-deep",
    title: "16. Синий глубокий",
    hint: "Насыщенный синий, ближе к палитре сайта.",
  },
  {
    id: "ice-blue",
    title: "17. Ледяной",
    hint: "Холодный голубой с белым, почти айс.",
  },
  {
    id: "blue-gold",
    title: "18. Голубой + золото",
    hint: "Голубая база, золотые акценты.",
  },
  {
    id: "electric-blue",
    title: "19. Электрик-синий",
    hint: "Яркий неоновый синий, заметный.",
  },
  {
    id: "pastel-blue",
    title: "20. Пастельный голубой",
    hint: "Мягкий, светлый — хорош на светлой теме.",
  },
  {
    id: "ocean",
    title: "21. Океан",
    hint: "Градиент от голубого к тёмно-синему.",
  },
  {
    id: "amber",
    title: "22. Янтарный",
    hint: "Тёплый жёлтый без агрессивного оранжа.",
  },
  {
    id: "slate",
    title: "23. Сланцевый",
    hint: "Холодный серо-синий, строгий.",
  },
  {
    id: "original",
    title: "24. Оригинальный",
    hint: "Как карточки казино на главной (CasinoGridCard).",
  },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

function PreviewCard({ styleId, countdown }: { styleId: StyleId; countdown: string }) {
  return (
    <article
      className={`viewer-win-card contest-preview-card contest-style--${styleId} relative flex shrink-0 flex-col overflow-hidden`}
    >
      <div className="contest-preview-header">
        <span className="contest-preview-header-text">Конкурс месяца</span>
      </div>

      <div className="contest-preview-main">
        <div className="contest-preview-timer">{countdown}</div>

        <div className="contest-preview-copy">
          <p className="contest-preview-subtitle">
            Лучший занос месяца получит приз
          </p>
          <div className="contest-preview-prize">$100</div>
        </div>
      </div>

      <div className="px-2.5 pb-2 pt-0">
        <button type="button" className="contest-preview-btn viewer-win-action-btn rounded-full">
          Отправить занос
        </button>
      </div>
    </article>
  );
}

export function ContestStylePreview() {
  const monthEnd = useMemo(() => getCurrentMonthEnd(), []);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(getCountdownParts(monthEnd)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [monthEnd]);

  return (
    <div className="contest-preview-page space-y-6 pb-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
          Временная страница
        </p>
        <h1 className="text-lg font-extrabold text-[var(--text)]">
          Выбор стиля карточки конкурса
        </h1>
        <p className="text-sm leading-snug text-[var(--muted)]">
          Сравни варианты и напиши номер понравившегося — применю на главной.
        </p>
      </header>

      <div className="space-y-8">
        {STYLES.map((style) => (
          <section key={style.id} className="space-y-2">
            <div>
              <h2 className="text-sm font-bold text-[var(--text)]">{style.title}</h2>
              <p className="text-xs text-[var(--muted)]">{style.hint}</p>
            </div>

            <div className="contest-preview-viewport">
              <PreviewCard styleId={style.id} countdown={countdown} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
