export function FooterInfo() {
  return (
    <footer className="space-y-4 px-4 pb-4 pt-2 text-[var(--muted)]">
      <section>
        <h3 className="mb-2 text-sm font-bold text-[var(--text)]">
          Предупреждение:
        </h3>
        <p className="mb-2 text-xs leading-relaxed">
          Азартные игры предназначены для развлечения. Чтобы избежать проблем,
          придерживайтесь следующих правил:
        </p>
        <ol className="list-decimal space-y-1 pl-4 text-xs leading-relaxed">
          <li>Не рассматривайте азартные игры как источник дохода.</li>
          <li>Играйте только на средства, которые можете позволить себе потерять.</li>
          <li>Устанавливайте заранее лимиты по времени и деньгам.</li>
          <li>Играйте только в свободное время.</li>
          <li>Не пытайтесь компенсировать потери.</li>
        </ol>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold text-[var(--text)]">
          Отказ от ответственности:
        </h3>
        <p className="text-xs leading-relaxed">
          Мы не несём ответственности за возможные изменения условий бонусов,
          предложений или акций. Условия могут быть изменены без предварительного
          уведомления. Проверяйте актуальность информации на сайте партнёра перед
          участием.
        </p>
      </section>
    </footer>
  );
}
