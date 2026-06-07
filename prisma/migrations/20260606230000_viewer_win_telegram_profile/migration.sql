PRAGMA foreign_keys=OFF;

CREATE TABLE "new_ViewerWin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "screenshotUrl" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "telegramUsername" TEXT NOT NULL,
    "telegramDisplayName" TEXT,
    "telegramPhotoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ViewerWin_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_ViewerWin" (
    "id",
    "screenshotUrl",
    "partnerId",
    "telegramUsername",
    "sortOrder",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "screenshotUrl",
    "partnerId",
    "telegramUsername",
    "sortOrder",
    "isActive",
    "createdAt",
    "updatedAt"
FROM "ViewerWin";

DROP TABLE "ViewerWin";
ALTER TABLE "new_ViewerWin" RENAME TO "ViewerWin";

PRAGMA foreign_keys=ON;
