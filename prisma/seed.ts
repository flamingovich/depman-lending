import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@depman.local";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      siteTagline: "Работает с 2024 года",
      heroTitle: "Рейтинг лучших казино в 2026 году",
      searchPlaceholder: "Поиск казино",
      bottomBarCtaText: "Установить",
    },
    create: {
      id: "default",
      siteName: "DepMan",
      siteTagline: "Работает с 2024 года",
      heroTitle: "Рейтинг лучших казино в 2026 году",
      searchPlaceholder: "Поиск казино",
      promoBannerText: "Войди и забери эксклюзивные бонусы",
      promoButtonText: "Войти",
      bottomBarTitle: "Справочник партнёра",
      bottomBarRating: 5,
      bottomBarCtaText: "Установить",
    },
  });

  await prisma.partner.deleteMany({ where: { slug: "kick" } });

  const partners = [
    {
      name: "YouTube",
      slug: "youtube",
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
      cardLayout: "grid",
      sortOrder: 0,
      affiliateUrl: "https://youtube.com",
      bonuses: [
        { title: "Подписка", value: "FREE", description: "На канал" },
      ],
    },
    {
      name: "Fenix",
      slug: "fenix",
      badge: "NEW",
      rating: 4.8,
      logoUrl: "/logos/fenix.svg",
      logoLightUrl: "/logos/fenix.svg",
      logoDarkUrl: "/logos/fenix-dark.svg",
      accentColor: "#f59e0b",
      features: JSON.stringify([
        "Магазин бонусов",
        "Ежедневные турниры",
        "Быстрый вывод",
      ]),
      bonus1Label: "Вращения",
      bonus1Value: "300FS",
      promoCode: "DEPMAN",
      bonus2Label: "Депозит",
      bonus2Value: "425%",
      ctaText: "Играть",
      cardLayout: "grid",
      inTopStrip: true,
      topSortOrder: 0,
      sortOrder: 1,
      affiliateUrl: "#",
      bonuses: [{ title: "Пакет", value: "375FS +425%" }],
    },
    {
      name: "VODKA",
      slug: "vodka",
      badge: "NEW",
      rating: 4.7,
      logoUrl: "/logos/vodka.svg",
      logoLightUrl: "/logos/vodka.svg",
      logoDarkUrl: "/logos/vodka-dark.svg",
      accentColor: "#38bdf8",
      features: JSON.stringify([
        "Без верификации",
        "Мобильное приложение",
        "Высокий RTP",
      ]),
      bonus1Label: "Вращения",
      bonus1Value: "100FS",
      promoCode: "DEPMAN",
      bonus2Label: "Депозит",
      bonus2Value: "150%",
      ctaText: "Играть",
      cardLayout: "grid",
      inTopStrip: true,
      topSortOrder: 1,
      sortOrder: 2,
      affiliateUrl: "#",
      bonuses: [{ title: "Бонус", value: "250FS +150%" }],
    },
    {
      name: "Dragon Money",
      slug: "dragon-money",
      rating: 4.6,
      logoUrl: "/logos/dragon-money.svg",
      accentColor: "#22c55e",
      features: JSON.stringify([
        "Еженедельный кэшбэк",
        "Турниры",
        "VIP-клуб",
      ]),
      bonus1Label: "Вращения",
      bonus1Value: "200FS",
      bonus2Label: "Депозит",
      bonus2Value: "100%",
      ctaText: "Играть",
      cardLayout: "grid",
      inBestBlock: true,
      bestSortOrder: 1,
      sortOrder: 3,
      affiliateUrl: "#",
      bonuses: [{ title: "Старт", value: "200FS" }],
    },
    {
      name: "Telegram Casino",
      slug: "telegram-casino",
      description: "Играй в Telegram",
      badge: "NEW",
      rating: 4.8,
      logoUrl: "/logos/telegram-casino.svg",
      logoLightUrl: "/logos/telegram-casino.svg",
      logoDarkUrl: "/logos/telegram-casino-dark.svg",
      accentColor: "#3b82f6",
      features: JSON.stringify(["Мини-приложение", "Крипто", "24/7"]),
      ctaText: "Получить бонус",
      cardLayout: "compact",
      inTopStrip: true,
      topSortOrder: 2,
      sortOrder: 4,
      affiliateUrl: "https://t.me",
      bonuses: [{ title: "Кэшбэк", value: "15%" }],
    },
    {
      name: "Lucky Spin",
      slug: "lucky-spin",
      description: "Колесо фортуны каждый день",
      rating: 4.7,
      logoUrl: "/logos/lucky-spin.svg",
      accentColor: "#a855f7",
      ctaText: "Получить бонус",
      cardLayout: "compact",
      sortOrder: 5,
      affiliateUrl: "#",
      bonuses: [{ title: "Бездеп", value: "500 ₽" }],
    },
    {
      name: "ARKADA",
      slug: "arkada",
      rating: 4.5,
      logoUrl: "/logos/arkada.svg",
      accentColor: "#ef4444",
      ctaText: "Получить бонус",
      cardLayout: "compact",
      sortOrder: 6,
      affiliateUrl: "#",
      bonuses: [{ title: "Релоад", value: "50%" }],
    },
  ];

  for (const partner of partners) {
    const { bonuses, ...data } = partner;
    const created = await prisma.partner.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });

    await prisma.bonus.deleteMany({ where: { partnerId: created.id } });
    for (const [index, bonus] of bonuses.entries()) {
      await prisma.bonus.create({
        data: {
          partnerId: created.id,
          title: bonus.title,
          value: bonus.value,
          description: (bonus as { description?: string }).description,
          sortOrder: index,
        },
      });
    }
  }

  console.log("Seed complete");
  console.log(`Admin: ${email} / ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
