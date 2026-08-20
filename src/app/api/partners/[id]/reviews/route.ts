import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().min(3).max(1000),
  authorName: z.string().min(1).max(60).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const partner = await prisma.partner.findUnique({
    where: { id, isActive: true },
    select: { id: true },
  });

  if (!partner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reviews = await prisma.review.findMany({
    where: { partnerId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      authorName: true,
      rating: true,
      text: true,
      createdAt: true,
    },
  });

  return NextResponse.json(reviews);
}

const REVIEW_LIMIT = 5;
const REVIEW_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request, context: RouteContext) {
  try {
    const limit = checkRateLimit(
      `review:${clientIp(request)}`,
      REVIEW_LIMIT,
      REVIEW_WINDOW_MS,
    );
    if (!limit.ok) {
      return tooManyRequests(
        "Слишком много отзывов подряд. Попробуйте позже.",
        limit.retryAfterSeconds,
      );
    }

    const { id } = await context.params;
    const body = reviewSchema.parse(await request.json());

    const partner = await prisma.partner.findUnique({
      where: { id, isActive: true },
      select: { id: true },
    });

    if (!partner) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        partnerId: id,
        rating: body.rating,
        text: body.text.trim(),
        authorName: body.authorName?.trim() || "Гость",
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
