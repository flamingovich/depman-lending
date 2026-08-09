import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

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

/**
 * Cloudflare часто режет Node fetch по TLS fingerprint.
 * curl с того же VPS проходит — используем его для Royal API.
 */
async function curlRoyalJson(
  url: string,
  royalToken: string,
): Promise<{ status: number; body: string }> {
  const { stdout } = await execFileAsync(
    "curl",
    [
      "-sS",
      "-w",
      "\n%{http_code}",
      "-H",
      "Accept: application/json",
      "-H",
      "Content-Type: application/json",
      "-H",
      `Authorization: Bearer ${royalToken}`,
      "--max-time",
      "30",
      url,
    ],
    { maxBuffer: 20 * 1024 * 1024 },
  );

  const trimmed = stdout.trimEnd();
  const nl = trimmed.lastIndexOf("\n");
  if (nl === -1) {
    return { status: 0, body: trimmed };
  }
  const body = trimmed.slice(0, nl);
  const status = Number(trimmed.slice(nl + 1));
  return { status: Number.isFinite(status) ? status : 0, body };
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
    const { status, body } = await curlRoyalJson(url, royalToken);

    if (status !== 429) {
      if (status < 200 || status >= 300) {
        throw new Error(
          `Royal promos HTTP ${status}${body ? `: ${body.slice(0, 200)}` : ""}`,
        );
      }
      return JSON.parse(body) as RoyalPromosListResponse;
    }

    if (attempt === maxAttempts - 1) break;

    const waitMs = Math.min(120_000, 2500 * 2 ** attempt + Math.floor(Math.random() * 400));
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
