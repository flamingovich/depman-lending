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
import { slugify } from "@/lib/utils";

const bonusSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  value: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const partnerSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  logoLightUrl: z.string().optional(),
  logoDarkUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: { bonuses: { orderBy: { sortOrder: "asc" } } },
    });
    if (!partner) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(partner);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    const existing = await prisma.partner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = partnerSchema.parse(await request.json());
    const { bonuses, features, name, slug, kind, ...rest } = body;
    const normalized = applyPartnerKindConstraints(
      {
        ...rest,
        ...(kind !== undefined ? { kind: normalizePartnerKind(kind) } : {}),
      },
      existing.kind,
    );

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        ...normalized,
        ...(name ? { name } : {}),
        ...(slug ? { slug } : name ? { slug: slugify(name) } : {}),
        ...(features ? { features: JSON.stringify(features) } : {}),
      },
    });

    if (bonuses) {
      await prisma.bonus.deleteMany({ where: { partnerId: id } });
      if (bonuses.length > 0) {
        await prisma.bonus.createMany({
          data: bonuses.map((bonus, index) => ({
            partnerId: id,
            title: bonus.title,
            description: bonus.description,
            value: bonus.value,
            sortOrder: bonus.sortOrder ?? index,
            isActive: bonus.isActive ?? true,
          })),
        });
      }
    }

    if (body.isFeatured && partner.kind === PARTNER_KINDS.channel) {
      await prisma.partner.updateMany({
        where: {
          id: { not: id },
          isFeatured: true,
          kind: PARTNER_KINDS.channel,
        },
        data: { isFeatured: false },
      });
    }

    const updated = await prisma.partner.findUnique({
      where: { id: partner.id },
      include: { bonuses: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return partnerApiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    await prisma.partner.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
