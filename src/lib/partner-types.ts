export type BonusInput = {
  title: string;
  description?: string;
  value?: string;
};

export type PartnerFormData = {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  logoLightUrl?: string;
  logoDarkUrl?: string;
  personImageUrl?: string;
  cardScreenshotUrl?: string;
  badge?: string;
  rating: number;
  accentColor: string;
  features: string;
  affiliateUrl?: string;
  promoCode?: string;
  bonus1Label?: string;
  bonus1Value?: string;
  bonus2Label?: string;
  bonus2Value?: string;
  cardLayout: string;
  kind: string;
  ctaText: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  bonuses: BonusInput[];
};
