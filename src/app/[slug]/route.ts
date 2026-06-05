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
  if (!partner?.affiliateUrl) {
    notFound();
  }

  return NextResponse.redirect(partner.affiliateUrl, 302);
}
