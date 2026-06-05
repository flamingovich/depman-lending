-- AlterTable
ALTER TABLE "Partner" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'casino';

-- Existing YouTube promos are channels, not casino catalog entries
UPDATE "Partner" SET "kind" = 'channel' WHERE "slug" = 'youtube';
