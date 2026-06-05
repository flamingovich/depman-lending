const PAYMENT_METHODS = [
  { id: "visa", src: "/methods/visa.svg", alt: "Visa" },
  { id: "sbp", src: "/methods/sbp.svg", alt: "СБП", compact: true },
  { id: "skrill", src: "/methods/skrill.svg", alt: "Skrill" },
  {
    id: "piastrix",
    src: "/methods/piastrix.svg",
    alt: "Piastrix",
    invertOnLight: true,
  },
  { id: "fk", src: "/methods/fk.svg", alt: "FK Wallet", invertOnLight: true },
  { id: "bybit", src: "/methods/bybit.svg", alt: "Bybit", invertOnLight: true },
] as const;

export function PaymentMethodsRow() {
  return (
    <div className="payment-methods-row" aria-label="Способы оплаты">
      {PAYMENT_METHODS.map((method) => {
        const classes = [
          "payment-method-logo",
          "compact" in method && method.compact
            ? "payment-method-logo--sbp"
            : "",
          "invertOnLight" in method && method.invertOnLight
            ? "payment-method-logo--invert-light"
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={method.id} src={method.src} alt={method.alt} className={classes} />
        );
      })}
    </div>
  );
}
