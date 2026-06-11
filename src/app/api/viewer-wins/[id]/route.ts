import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidateViewerWinsPages } from "@/lib/revalidate-catalog";
import { normalizeTelegramUsername } from "@/lib/telegram-url";

const viewerWinSchema = z.object({
  screenshotUrl: z.string().min(1).optional(),
  cropX: z.number().min(0).max(1).optional(),
  cropY: z.number().min(0).max(1).optional(),
  cropWidth: z.number().min(0.01).max(1).optional(),
  cropHeight: z.number().min(0.01).max(1).optional(),
  partnerId: z.string().min(1).optional(),
  telegramDisplayName: z.string().min(1).optional(),
  telegramUsername: z.string().min(1).optional(),
  winAmount: z.string().optional(),
  winMultiplier: z.string().optional(),
  slotName: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isBigWin: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    const existing = await prisma.viewerWin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = viewerWinSchema.parse(await request.json());
    const data: {
      screenshotUrl?: string;
      cropX?: number;
      cropY?: number;
      cropWidth?: number;
      cropHeight?: number;
      partnerId?: string;
      telegramUsername?: string | null;
      telegramDisplayName?: string | null;
      telegramPhotoUrl?: string | null;
      winAmount?: string | null;
      winMultiplier?: string | null;
      slotName?: string | null;
      sortOrder?: number;
      isActive?: boolean;
      isBigWin?: boolean;
    } = {};

    if (body.screenshotUrl !== undefined) data.screenshotUrl = body.screenshotUrl;
    if (body.cropX !== undefined) data.cropX = body.cropX;
    if (body.cropY !== undefined) data.cropY = body.cropY;
    if (body.cropWidth !== undefined) data.cropWidth = body.cropWidth;
    if (body.cropHeight !== undefined) data.cropHeight = body.cropHeight;
    if (body.partnerId !== undefined) {
      const partner = await prisma.partner.findUnique({
        where: { id: body.partnerId },
      });
      if (!partner) {
        return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
      }
      data.partnerId = body.partnerId;
    }
    if (body.telegramDisplayName !== undefined) {
      data.telegramDisplayName = body.telegramDisplayName.trim();
    }
    if (body.telegramUsername !== undefined) {
      const username = normalizeTelegramUsername(body.telegramUsername);
      if (!username) {
        return NextResponse.json(
          { error: "Укажите корректный Telegram username" },
          { status: 400 },
        );
      }
      data.telegramUsername = username;
      data.telegramPhotoUrl = null;
    }
    if (body.winAmount !== undefined) data.winAmount = body.winAmount.trim() || null;
    if (body.winMultiplier !== undefined) {
      data.winMultiplier = body.winMultiplier.trim() || null;
    }
    if (body.slotName !== undefined) data.slotName = body.slotName.trim() || null;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.isBigWin !== undefined) data.isBigWin = body.isBigWin;

    const win = await prisma.viewerWin.update({
      where: { id },
      data,
      include: {
        partner: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    revalidateViewerWinsPages();
    return NextResponse.json(win);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("[viewer-wins PATCH]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireSession();
    const { id } = await context.params;
    await prisma.viewerWin.delete({ where: { id } });
    revalidateViewerWinsPages();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
