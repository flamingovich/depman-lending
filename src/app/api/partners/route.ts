import { NextResponse } from "next/server";
import { z } from "zod";
import { partnerApiErrorResponse } from "@/lib/api-errors";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  applyPartnerKindConstraints,
  normalizePartnerKind,
  PARTNER_KINDS,
} from "@/lib/partner-kind";
import { revalidateCatalogPages } from "@/lib/revalidate-catalog";
import { slugify } from "@/lib/utils";

const bonusSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  value: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const partnerSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  logoLightUrl: z.string().optional(),
  logoDarkUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  personImageUrl: z.string().nullish(),
  badge: z.string().optional(),
  rating: z.number().optional(),
  accentColor: z.string().optional(),
  features: z.array(z.string()).optional(),
  affiliateUrl: z.string().optional(),
  promoCode: z.string().optional(),
  bonus1Label: z.string().optional(),
  bonus1Value: z.string().optional(),
  bonus2Label: z.string().optional(),
  bonus2Value: z.string().optional(),
  cardLayout: z.enum(["grid", "compact"]).optional(),
  kind: z.enum(["casino", "channel"]).optional(),
  inTopStrip: z.boolean().optional(),
  inBestBlock: z.boolean().optional(),
  topSortOrder: z.number().int().optional(),
  bestSortOrder: z.number().int().optional(),
  ctaText: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  bonuses: z.array(bonusSchema).optional(),
});

export async function GET() {
  try {
    await requireSession();
    const partners = await prisma.partner.findMany({
      include: { bonuses: { orderBy: { sortOrder: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(partners);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = partnerSchema.parse(await request.json());
    const slug = body.slug?.trim() || slugify(body.name);
    const { bonuses, features, ...rest } = body;
    const normalized = applyPartnerKindConstraints({
      ...rest,
      kind: normalizePartnerKind(body.kind),
    });

    const partner = await prisma.partner.create({
      data: {
        ...normalized,
        slug,
        features: JSON.stringify(features ?? []),
        bonuses: bonuses
          ? {
              create: bonuses.map((bonus, index) => ({
                title: bonus.title,
                description: bonus.description,
                value: bonus.value,
                sortOrder: bonus.sortOrder ?? index,
                isActive: bonus.isActive ?? true,
              })),
            }
          : undefined,
      },
      include: { bonuses: true },
    });

    if (partner.isFeatured && partner.kind === PARTNER_KINDS.channel) {
      await prisma.partner.updateMany({
        where: {
          id: { not: partner.id },
          isFeatured: true,
          kind: PARTNER_KINDS.channel,
        },
        data: { isFeatured: false },
      });
    }

    revalidateCatalogPages();

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    return partnerApiErrorResponse(error);
  }
}
