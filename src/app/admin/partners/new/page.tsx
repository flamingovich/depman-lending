import { PartnerForm } from "@/components/admin/PartnerForm";

export default function NewPartnerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Новый проект</h1>
        <p className="text-sm text-slate-500">
          Добавьте партнёрский проект в каталог Mini App
        </p>
      </div>

      <PartnerForm
        mode="create"
        initial={{
          name: "",
          description: "",
          badge: "",
          rating: 5,
          accentColor: "#b8ff3c",
          features: JSON.stringify([
            "Без верификации",
            "Гибкая система бонусов",
            "Быстрые депозиты и выводы",
          ]),
          affiliateUrl: "",
          promoCode: "DEPMAN",
          bonus1Label: "Бонус за регистрацию",
          bonus1Value: "100 FS",
          bonus2Label: "Бонус за депозит",
          bonus2Value: "до 500 FS + 225%",
          cardLayout: "grid",
          ctaText: "Забрать бонусы",
          isFeatured: false,
          isActive: true,
          sortOrder: 0,
          bonuses: [
            {
              title: "Стартовый Пакет",
              value: "до 600 FS + 225%",
              description: "",
            },
          ],
        }}
      />
    </div>
  );
}
