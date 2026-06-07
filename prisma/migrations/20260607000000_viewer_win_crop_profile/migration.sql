-- Redesign viewer wins: crop region, Telegram user ID, win stats
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_ViewerWin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "screenshotUrl" TEXT NOT NULL,
    "cropX" REAL NOT NULL DEFAULT 0,
    "cropY" REAL NOT NULL DEFAULT 0,
    "cropWidth" REAL NOT NULL DEFAULT 1,
    "cropHeight" REAL NOT NULL DEFAULT 0.5625,
    "partnerId" TEXT NOT NULL,
    "telegramUserId" TEXT NOT NULL DEFAULT '',
    "telegramUsername" TEXT,
    "telegramDisplayName" TEXT,
    "telegramPhotoUrl" TEXT,
    "winAmount" TEXT,
    "winMultiplier" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ViewerWin_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_ViewerWin" (
    "id", "screenshotUrl", "partnerId", "telegramUserId", "telegramUsername",
    "telegramDisplayName", "telegramPhotoUrl", "sortOrder", "isActive", "createdAt", "updatedAt"
)
SELECT
    "id", "screenshotUrl", "partnerId", '', "telegramUsername",
    "telegramDisplayName", "telegramPhotoUrl", "sortOrder", "isActive", "createdAt", "updatedAt"
FROM "ViewerWin";

DROP TABLE "ViewerWin";
ALTER TABLE "new_ViewerWin" RENAME TO "ViewerWin";

PRAGMA foreign_keys=ON;
