-- AlterTable
ALTER TABLE "Partner" ADD COLUMN "homeBlock" TEXT NOT NULL DEFAULT 'all';

-- Migrate existing partners to match previous layout logic
UPDATE "Partner" SET "homeBlock" = 'top' WHERE "badge" = 'NEW' AND "isFeatured" = 0;
UPDATE "Partner" SET "homeBlock" = 'best' WHERE "cardLayout" = 'grid' AND "isFeatured" = 0 AND "homeBlock" = 'all';
UPDATE "Partner" SET "homeBlock" = 'all' WHERE "cardLayout" = 'compact' AND "isFeatured" = 0;
