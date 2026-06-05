import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BEST_BLOCK_LIMIT } from "@/lib/home-blocks";

const layoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      sortOrder: z.number().int(),
      inTopStrip: z.boolean(),
      inBestBlock: z.boolean(),
      topSortOrder: z.number().int(),
      bestSortOrder: z.number().int(),
    }),
  ),
});

function errorMessage(error: unknown) {
  if (process.env.NODE_ENV !== "development") {
    return "Invalid data";
  }
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid data";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Invalid data";
}

export async function PUT(request: Request) {
  try {
    await requireSession();
    const { items } = layoutSchema.parse(await request.json());

    const bestCount = items.filter((item) => item.inBestBlock).length;
    if (bestCount > BEST_BLOCK_LIMIT) {
      return NextResponse.json(
        { error: `В блоке «Лучшие» можно разметить не более ${BEST_BLOCK_LIMIT} проектов` },
        { status: 400 },
      );
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.partner.update({
          where: { id: item.id },
          data: {
            sortOrder: item.sortOrder,
            inTopStrip: item.inTopStrip,
            inBestBlock: item.inBestBlock,
            topSortOrder: item.topSortOrder,
            bestSortOrder: item.bestSortOrder,
          },
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[home-layout]", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}
