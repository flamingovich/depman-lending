import type { BonusInput, PartnerFormData } from "@/lib/partner-types";
import { isChannelKind, normalizePartnerKind } from "@/lib/partner-kind";

function optionalText(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildPartnerPayload(
  form: PartnerFormData,
  featuresText: string,
) {
  const features = featuresText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const rating = Number(form.rating);
  const sortOrder = Math.round(Number(form.sortOrder));

  return {
    name: form.name.trim(),
    slug: optionalText(form.slug),
    kind: normalizePartnerKind(form.kind),
    description: optionalText(form.description),
    logoUrl: optionalText(form.logoUrl),
    logoLightUrl: optionalText(form.logoLightUrl),
    logoDarkUrl: optionalText(form.logoDarkUrl),
    badge: optionalText(form.badge),
    rating: Number.isFinite(rating) ? rating : 5,
    accentColor: form.accentColor,
    features,
    affiliateUrl: optionalText(form.affiliateUrl),
    promoCode: optionalText(form.promoCode),
    bonus1Label: optionalText(form.bonus1Label),
    bonus1Value: optionalText(form.bonus1Value),
    bonus2Label: optionalText(form.bonus2Label),
    bonus2Value: optionalText(form.bonus2Value),
    cardLayout: form.cardLayout === "compact" ? "compact" : "grid",
    ctaText: form.ctaText.trim() || "Перейти",
    isFeatured: isChannelKind(form.kind) ? form.isFeatured : false,
    isActive: form.isActive,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    bonuses: form.bonuses
      .filter((bonus) => bonus.title.trim())
      .map((bonus) => ({
        title: bonus.title.trim(),
        description: optionalText(bonus.description),
        value: optionalText(bonus.value),
      })),
  };
}

export type PartnerPayload = ReturnType<typeof buildPartnerPayload>;
