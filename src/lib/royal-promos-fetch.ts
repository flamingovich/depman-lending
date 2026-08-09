const ROYAL_PROMOS_URL =
  "https://royal.partners/api/customer/v1/partner/promos";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export type RoyalPromoItem = {
  id: number;
  name: string;
  code?: string;
  tracking_link?: string;
  landing_url?: string;
  campaign?: { id?: number; name?: string };
  brand?: { id?: number; name?: string };
  created_at?: string;
  archived_at?: string | null;
};

type RoyalPromosListResponse = {
  current_page?: number;
  total_pages?: number;
  total_count?: number;
  items?: RoyalPromoItem[];
};

export function promoActiveUrl(p: RoyalPromoItem): string {
  const tracking =
    typeof p.tracking_link === "string" ? p.tracking_link.trim() : "";
  if (tracking) return tracking;
  return typeof p.landing_url === "string" ? p.landing_url.trim() : "";
}

/** Одна строка на кампанию: берём промо с tracking_link, иначе первое с URL. */
export function groupPromosByCampaign(
  promos: RoyalPromoItem[],
): RoyalPromoItem[] {
  const byCampaign = new Map<number, RoyalPromoItem[]>();
  for (const p of promos) {
    const cid = p.campaign?.id;
    if (cid == null || !Number.isFinite(Number(cid))) continue;
    if (p.archived_at) continue;
    const url = promoActiveUrl(p);
    if (!url) continue;
    const id = Number(cid);
    const list = byCampaign.get(id) ?? [];
    list.push(p);
    byCampaign.set(id, list);
  }
  const picked: RoyalPromoItem[] = [];
  for (const list of byCampaign.values()) {
    const withTracking = list.find((p) => p.tracking_link?.trim());
    picked.push(withTracking ?? list[0]!);
  }
  return picked.sort((a, b) =>
    (a.campaign?.name ?? "").localeCompare(b.campaign?.name ?? "", "ru"),
  );
}

async function fetchRoyalPromosPage(
  royalToken: string,
  campaignIds: string[],
  page: number,
): Promise<RoyalPromosListResponse> {
  const params = new URLSearchParams();
  for (const id of campaignIds) {
    params.append("campaign_ids[]", id);
  }
  params.set("page", String(page));
  params.set("per_page", "100");

  const url = `${ROYAL_PROMOS_URL}?${params.toString()}`;
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${royalToken}`,
      },
      cache: "no-store",
    });

    if (response.status !== 429) {
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(
          `Royal promos HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`,
        );
      }
      return (await response.json()) as RoyalPromosListResponse;
    }

    if (attempt === maxAttempts - 1) break;

    const ra = Number(response.headers.get("retry-after"));
    const base =
      Number.isFinite(ra) && ra > 0
        ? Math.min(ra * 1000, 90_000)
        : 2500 * 2 ** attempt;
    const jitter = Math.floor(Math.random() * 400);
    const waitMs = Math.min(120_000, base + jitter);
    console.warn(
      `[RoyalPromos] page ${page}: 429, пауза ${waitMs}ms (попытка ${attempt + 1}/${maxAttempts})`,
    );
    await sleep(waitMs);
  }

  throw new Error("Royal promos: исчерпаны повторы после 429");
}

export async function fetchRoyalPromosForCampaigns(
  royalToken: string,
  campaignIds: string[],
): Promise<RoyalPromoItem[]> {
  const ids = [
    ...new Set(campaignIds.map((id) => id.trim()).filter(Boolean)),
  ];
  if (ids.length === 0) return [];

  const allItems: RoyalPromoItem[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchRoyalPromosPage(royalToken, ids, page);
    totalPages = Math.max(1, Number(data.total_pages) || 1);
    if (Array.isArray(data.items)) allItems.push(...data.items);
    page += 1;
  }

  return groupPromosByCampaign(allItems);
}
