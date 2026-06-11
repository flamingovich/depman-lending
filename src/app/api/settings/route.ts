import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const settingsSchema = z.object({
  siteName: z.string().optional(),
  siteTagline: z.string().optional(),
  heroTitle: z.string().optional(),
  searchPlaceholder: z.string().optional(),
  promoBannerText: z.string().optional(),
  promoButtonText: z.string().optional(),
  bottomBarTitle: z.string().optional(),
  bottomBarRating: z.number().optional(),
  bottomBarCtaText: z.string().optional(),
  telegramBotUrl: z.string().optional().nullable(),
  pinnedPartnerId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    await requireSession();
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSession();
    const body = settingsSchema.parse(await request.json());
    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: body,
      create: { id: "default", ...body },
    });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
