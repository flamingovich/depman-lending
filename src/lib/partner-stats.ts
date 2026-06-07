export type PartnerBonusFields = {
  bonus1Label?: string | null;
  bonus1Value?: string | null;
  bonus2Label?: string | null;
  bonus2Value?: string | null;
  promoCode?: string | null;
};

export type PartnerStatRow = {
  label: string;
  value: string;
  copyable?: boolean;
};

export function buildPartnerStats(partner: PartnerBonusFields): PartnerStatRow[] {
  const stats: PartnerStatRow[] = [];

  const bonus1Value = partner.bonus1Value?.trim();
  if (bonus1Value) {
    stats.push({
      label: partner.bonus1Label?.trim() || "Бонус 1",
      value: bonus1Value,
    });
  }

  const bonus2Value = partner.bonus2Value?.trim();
  if (bonus2Value) {
    stats.push({
      label: partner.bonus2Label?.trim() || "Бонус 2",
      value: bonus2Value,
    });
  }

  const promoCode = partner.promoCode?.trim();
  if (promoCode) {
    stats.push({
      label: "Промокод",
      value: promoCode,
      copyable: true,
    });
  }

  return stats;
}

export function buildDetailCoreStats(partner: PartnerBonusFields): PartnerStatRow[] {
  return buildPartnerStats(partner).filter((row) => row.label !== "Промокод");
}

type BonusSummarySource = PartnerBonusFields & {
  bonuses?: { title: string; value?: string | null }[];
};

export function buildBonusSummary(partner: BonusSummarySource): string | null {
  const bonusRow = partner.bonuses?.find(
    (bonus) => bonus.title.trim().toLowerCase() === "бонус",
  );
  if (bonusRow) {
    return bonusRow.value?.trim() || bonusRow.title.trim() || null;
  }

  const parts = [partner.bonus1Value, partner.bonus2Value]
    .map((value) => value?.trim())
    .filter(Boolean);

  return parts.length ? parts.join(" + ") : null;
}
