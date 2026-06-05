-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT 'DepMan',
    "siteTagline" TEXT NOT NULL DEFAULT 'Партнёрские проекты',
    "heroTitle" TEXT NOT NULL DEFAULT '⭐ Рейтинг лучших партнёров',
    "searchPlaceholder" TEXT NOT NULL DEFAULT 'Поиск проекта',
    "promoBannerText" TEXT NOT NULL DEFAULT 'Войди и забери эксклюзивные бонусы',
    "promoButtonText" TEXT NOT NULL DEFAULT 'Войти',
    "bottomBarTitle" TEXT NOT NULL DEFAULT 'Справочник партнёра',
    "bottomBarRating" REAL NOT NULL DEFAULT 5.0,
    "bottomBarCtaText" TEXT NOT NULL DEFAULT 'Открыть',
    "telegramBotUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "badge" TEXT,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "accentColor" TEXT NOT NULL DEFAULT '#b8ff3c',
    "features" TEXT NOT NULL DEFAULT '[]',
    "affiliateUrl" TEXT,
    "promoCode" TEXT,
    "ctaText" TEXT NOT NULL DEFAULT 'Перейти',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Bonus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bonus_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");
