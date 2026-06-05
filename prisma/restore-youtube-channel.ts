import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { PARTNER_KINDS } from "../src/lib/partner-kind";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const data = {
    name: "YouTube",
    slug: "youtube",
    kind: PARTNER_KINDS.channel,
    description: "Актуальный канал на котором проходят стримы",
    badge: "HOT",
    rating: 4.9,
    logoUrl: "/icons/youtube.svg",
    logoLightUrl: "/icons/youtube.svg",
    logoDarkUrl: "/icons/youtube.svg",
    accentColor: "#FF0000",
    features: JSON.stringify([
      "Казино-стримы",
      "Начало с 00:00 по МСК",
      "Денежные розыгрыши",
    ]),
    ctaText: "Смотреть",
    isFeatured: true,
    isActive: true,
    sortOrder: 0,
    inTopStrip: false,
    inBestBlock: false,
    affiliateUrl: "https://youtube.com",
  };

  const partner = await prisma.partner.upsert({
    where: { slug: "youtube" },
    update: data,
    create: data,
  });

  await prisma.partner.updateMany({
    where: {
      id: { not: partner.id },
      isFeatured: true,
      kind: PARTNER_KINDS.channel,
    },
    data: { isFeatured: false },
  });

  await prisma.bonus.deleteMany({ where: { partnerId: partner.id } });
  await prisma.bonus.create({
    data: {
      partnerId: partner.id,
      title: "Подписка",
      value: "FREE",
      description: "На канал",
      sortOrder: 0,
    },
  });

  console.log("YouTube promo channel restored:", partner.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
