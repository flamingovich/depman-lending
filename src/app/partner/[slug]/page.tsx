import { notFound, permanentRedirect } from "next/navigation";
import { PartnerDetailShell } from "@/components/miniapp/PartnerDetailShell";
import { getPartnerBySlug } from "@/lib/data";
import { parseFeatures } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PartnerPage({ params }: PageProps) {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);
  if (!partner) notFound();
  if (partner.slug !== slug) permanentRedirect(`/partner/${partner.slug}`);

  return (
    <PartnerDetailShell
      partner={{
        id: partner.id,
        slug: partner.slug,
        name: partner.name,
        description: partner.description,
        logoUrl: partner.logoUrl,
        logoLightUrl: partner.logoLightUrl,
        logoDarkUrl: partner.logoDarkUrl,
        accentColor: partner.accentColor,
        rating: partner.rating,
        features: parseFeatures(partner.features),
        promoCode: partner.promoCode,
        bonus1Label: partner.bonus1Label,
        bonus1Value: partner.bonus1Value,
        bonus2Label: partner.bonus2Label,
        bonus2Value: partner.bonus2Value,
        affiliateUrl: partner.affiliateUrl,
        bonuses: partner.bonuses.map((bonus) => ({
          id: bonus.id,
          title: bonus.title,
          value: bonus.value,
          description: bonus.description,
        })),
      }}
    />
  );
}
