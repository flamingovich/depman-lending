export const PARTNER_KINDS = {
  casino: "casino",
  channel: "channel",
} as const;

export type PartnerKind = (typeof PARTNER_KINDS)[keyof typeof PARTNER_KINDS];

export function isChannelKind(kind: string | undefined | null) {
  return kind === PARTNER_KINDS.channel;
}

export function normalizePartnerKind(kind: string | undefined): PartnerKind {
  return kind === PARTNER_KINDS.channel
    ? PARTNER_KINDS.channel
    : PARTNER_KINDS.casino;
}

type PartnerKindFields = {
  kind?: string;
  inTopStrip?: boolean;
  inBestBlock?: boolean;
  isFeatured?: boolean;
};

export function applyPartnerKindConstraints<T extends PartnerKindFields>(
  data: T,
  existingKind?: string,
): T {
  const kind = normalizePartnerKind(data.kind ?? existingKind);

  if (isChannelKind(kind)) {
    return {
      ...data,
      kind,
      inTopStrip: false,
      inBestBlock: false,
    };
  }

  return {
    ...data,
    kind,
    isFeatured: false,
  };
}
