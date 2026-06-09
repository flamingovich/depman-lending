import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateViewerWinsPages } from "@/lib/revalidate-catalog";
import { normalizeTelegramUsername } from "@/lib/telegram-url";

const viewerWinSchema = z.object({
  screenshotUrl: z.string().min(1),
  cropX: z.number().min(0).max(1).optional(),
  cropY: z.number().min(0).max(1).optional(),
  cropWidth: z.number().min(0.01).max(1).optional(),
  cropHeight: z.number().min(0.01).max(1).optional(),
  partnerId: z.string().min(1),
  telegramDisplayName: z.string().min(1, "Укажите имя зрителя"),
  telegramUsername: z.string().min(1, "Укажите Telegram username"),
  winAmount: z.string().optional(),
  winMultiplier: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isBigWin: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireSession();
    const wins = await prisma.viewerWin.findMany({
      include: {
        partner: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(wins);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = viewerWinSchema.parse(await request.json());
    const username = normalizeTelegramUsername(body.telegramUsername);
    if (!username) {
      return NextResponse.json(
        { error: "Укажите корректный Telegram username" },
        { status: 400 },
      );
    }

    const partner = await prisma.partner.findUnique({
      where: { id: body.partnerId },
    });
    if (!partner) {
      return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
    }

    const win = await prisma.viewerWin.create({
      data: {
        screenshotUrl: body.screenshotUrl,
        cropX: body.cropX ?? 0,
        cropY: body.cropY ?? 0,
        cropWidth: body.cropWidth ?? 1,
        cropHeight: body.cropHeight ?? 0.5625,
        partnerId: body.partnerId,
        telegramUserId: "",
        telegramUsername: username,
        telegramDisplayName: body.telegramDisplayName.trim(),
        telegramPhotoUrl: null,
        winAmount: body.winAmount?.trim() || null,
        winMultiplier: body.winMultiplier?.trim() || null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
        isBigWin: body.isBigWin ?? false,
      },
      include: {
        partner: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    revalidateViewerWinsPages();
    return NextResponse.json(win, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("[viewer-wins POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
