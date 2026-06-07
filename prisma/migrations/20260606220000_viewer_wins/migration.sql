-- CreateTable
CREATE TABLE "ViewerWin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "screenshotUrl" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "slotName" TEXT NOT NULL,
    "telegramUsername" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ViewerWin_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
