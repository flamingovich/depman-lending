-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "logoLightUrl" TEXT,
    "logoDarkUrl" TEXT,
    "bannerUrl" TEXT,
    "badge" TEXT,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "accentColor" TEXT NOT NULL DEFAULT '#b8ff3c',
    "features" TEXT NOT NULL DEFAULT '[]',
    "affiliateUrl" TEXT,
    "promoCode" TEXT,
    "bonus1Label" TEXT,
    "bonus1Value" TEXT,
    "bonus2Label" TEXT,
    "bonus2Value" TEXT,
    "cardLayout" TEXT NOT NULL DEFAULT 'grid',
    "ctaText" TEXT NOT NULL DEFAULT 'Перейти',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Partner" (
    "id", "name", "slug", "description", "logoUrl", "logoLightUrl", "logoDarkUrl",
    "bannerUrl", "badge", "rating", "accentColor", "features", "affiliateUrl",
    "promoCode", "bonus1Label", "bonus1Value", "bonus2Label", "bonus2Value",
    "cardLayout", "ctaText", "isFeatured", "isActive", "sortOrder", "createdAt", "updatedAt"
)
SELECT
    "id", "name", "slug", "description", "logoUrl", "logoLightUrl", "logoDarkUrl",
    "bannerUrl", "badge", "rating", "accentColor", "features", "affiliateUrl",
    "promoCode",
    CASE
        WHEN "spinsBonus" IS NOT NULL AND "spinsBonus" != '' THEN 'Вращения'
        WHEN "registrationBonus" IS NOT NULL AND "registrationBonus" != '' THEN 'Регистрация'
        ELSE NULL
    END,
    COALESCE(NULLIF("spinsBonus", ''), NULLIF("registrationBonus", '')),
    CASE
        WHEN "depositBonus" IS NOT NULL AND "depositBonus" != '' THEN 'Депозит'
        ELSE NULL
    END,
    NULLIF("depositBonus", ''),
    "cardLayout", "ctaText", "isFeatured", "isActive", "sortOrder", "createdAt", "updatedAt"
FROM "Partner";
DROP TABLE "Partner";
ALTER TABLE "new_Partner" RENAME TO "Partner";
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
