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

  console.log("Seed complete");
  console.log(`Admin: ${email} / ${password}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
