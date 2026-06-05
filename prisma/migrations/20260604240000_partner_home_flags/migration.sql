-- Additive home layout flags (projects stay in "all" while also in top/best)
ALTER TABLE "Partner" ADD COLUMN "inTopStrip" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Partner" ADD COLUMN "inBestBlock" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Partner" ADD COLUMN "topSortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Partner" ADD COLUMN "bestSortOrder" INTEGER NOT NULL DEFAULT 0;

UPDATE "Partner" SET "inTopStrip" = true WHERE "homeBlock" = 'top';
UPDATE "Partner" SET "inBestBlock" = true WHERE "homeBlock" = 'best';

UPDATE "Partner" SET "topSortOrder" = "sortOrder" WHERE "inTopStrip" = true;
UPDATE "Partner" SET "bestSortOrder" = "sortOrder" WHERE "inBestBlock" = true;
