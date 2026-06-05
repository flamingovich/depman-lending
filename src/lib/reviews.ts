import { prisma } from "@/lib/db";

export async function recalculatePartnerRating(partnerId: string) {
  const agg = await prisma.review.aggregate({
    where: { partnerId },
    _avg: { rating: true },
  });

  if (agg._avg.rating == null) {
    return null;
  }

  const average = agg._avg.rating;

  await prisma.partner.update({
    where: { id: partnerId },
    data: { rating: Math.round(average * 10) / 10 },
  });

  return Math.round(average * 10) / 10;
}
