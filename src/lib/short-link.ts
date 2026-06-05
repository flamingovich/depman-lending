const RESERVED_SHORT_LINK_SLUGS = new Set([
  "admin",
  "partner",
  "api",
  "uploads",
  "_next",
  "login",
  "images",
  "icons",
  "logos",
  "methods",
]);

export function isReservedShortLinkSlug(slug: string) {
  return RESERVED_SHORT_LINK_SLUGS.has(slug.toLowerCase());
}

export function getPublicSiteUrl(fallback = "https://depman.vip") {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!fromEnv) return fallback.replace(/\/$/, "");
  return fromEnv.replace(/\/$/, "");
}

export function buildPartnerShortLink(slug: string, siteUrl = getPublicSiteUrl()) {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return "";
  return `${siteUrl}/${encodeURIComponent(normalizedSlug)}`;
}
