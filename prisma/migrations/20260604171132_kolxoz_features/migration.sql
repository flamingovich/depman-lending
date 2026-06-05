-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Partner" (
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
    "registrationBonus" TEXT,
    "spinsBonus" TEXT,
    "depositBonus" TEXT,
    "cardLayout" TEXT NOT NULL DEFAULT 'grid',
    "ctaText" TEXT NOT NULL DEFAULT 'Перейти',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Partner" ("accentColor", "affiliateUrl", "badge", "bannerUrl", "createdAt", "ctaText", "description", "features", "id", "isActive", "isFeatured", "logoUrl", "name", "promoCode", "rating", "slug", "sortOrder", "updatedAt") SELECT "accentColor", "affiliateUrl", "badge", "bannerUrl", "createdAt", "ctaText", "description", "features", "id", "isActive", "isFeatured", "logoUrl", "name", "promoCode", "rating", "slug", "sortOrder", "updatedAt" FROM "Partner";
DROP TABLE "Partner";
ALTER TABLE "new_Partner" RENAME TO "Partner";
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
