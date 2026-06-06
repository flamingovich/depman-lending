import { notFound } from "next/navigation";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { prisma } from "@/lib/db";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPartnerPage({ params }: PageProps) {
  const { id } = await params;
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: { bonuses: { orderBy: { sortOrder: "asc" } } },
  });

  if (!partner) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Редактировать: {partner.name}
        </h1>
        <p className="text-sm text-slate-400">Обновите данные проекта и бонусы</p>
      </div>

      <PartnerForm
        mode="edit"
        initial={{
          id: partner.id,
          name: partner.name,
          slug: partner.slug,
          description: partner.description ?? "",
          logoUrl: partner.logoUrl ?? "",
          logoLightUrl: partner.logoLightUrl ?? "",
          logoDarkUrl: partner.logoDarkUrl ?? "",
          personImageUrl: partner.personImageUrl ?? "",
          badge: partner.badge ?? "",
          rating: partner.rating,
          accentColor: partner.accentColor,
          features: partner.features,
          affiliateUrl: partner.affiliateUrl ?? "",
          promoCode: partner.promoCode ?? "",
          bonus1Label: partner.bonus1Label ?? "",
          bonus1Value: partner.bonus1Value ?? "",
          bonus2Label: partner.bonus2Label ?? "",
          bonus2Value: partner.bonus2Value ?? "",
          cardLayout: partner.cardLayout,
          kind: partner.kind,
          ctaText: partner.ctaText,
          isFeatured: partner.isFeatured,
          isActive: partner.isActive,
          sortOrder: partner.sortOrder,
          bonuses:
            partner.bonuses.length > 0
              ? partner.bonuses.map((b) => ({
                  title: b.title,
                  description: b.description ?? "",
                  value: b.value ?? "",
                }))
              : [{ title: "", value: "", description: "" }],
        }}
      />
    </div>
  );
}
