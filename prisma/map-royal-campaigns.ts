/**
 * One-shot: set Partner.royalCampaignId from slug map.
 * Usage: npx tsx prisma/map-royal-campaigns.ts
 */
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { ROYAL_CAMPAIGN_ID_BY_SLUG } from "../src/lib/royal-campaign-map";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const partners = await prisma.partner.findMany({
    select: { id: true, name: true, slug: true, royalCampaignId: true },
  });

  let updated = 0;
  for (const partner of partners) {
    const campaignId = ROYAL_CAMPAIGN_ID_BY_SLUG[partner.slug.toLowerCase()];
    if (!campaignId) {
      console.log(`skip ${partner.slug} (${partner.name}) — no mapping`);
      continue;
    }
    if (partner.royalCampaignId === campaignId) {
      console.log(`ok   ${partner.slug} → ${campaignId}`);
      continue;
    }
    await prisma.partner.update({
      where: { id: partner.id },
      data: { royalCampaignId: campaignId },
    });
    updated += 1;
    console.log(`set  ${partner.slug} → ${campaignId}`);
  }

  console.log(`Done. Updated: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
