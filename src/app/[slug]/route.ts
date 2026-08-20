import { getPartnerBySlug } from "@/lib/data";
import { isReservedShortLinkSlug } from "@/lib/short-link";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  if (isReservedShortLinkSlug(slug)) {
    notFound();
  }

  const partner = await getPartnerBySlug(slug);
  const target = partner?.affiliateUrl?.trim();

  // Заглушки вроде "#" раньше улетали в redirect() и роняли роут в 500.
  if (!target || !/^https?:\/\//i.test(target)) {
    notFound();
  }

  return NextResponse.redirect(target, 302);
}
