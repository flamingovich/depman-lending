/**
 * Разовый прогон: ужимает уже загруженные картинки и переводит их в WebP,
 * обновляя ссылки в базе. Оригиналы не удаляются, а уезжают в
 * public/uploads/_originals — чтобы можно было откатиться.
 *
 *   npx tsx scripts/optimize-uploads.ts            # только показать план
 *   npx tsx scripts/optimize-uploads.ts --apply    # выполнить
 */
import "dotenv/config";
import { mkdir, readdir, rename, stat, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  optimizeUploadImage,
  type UploadRole,
} from "../src/lib/process-upload-image";

const APPLY = process.argv.includes("--apply");
const UPLOAD_PREFIX = "/uploads/logos/";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "logos");
const ORIGINALS_DIR = path.join(process.cwd(), "public", "uploads", "_originals");

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const PARTNER_FIELDS: { field: string; role: UploadRole }[] = [
  { field: "logoUrl", role: "logo" },
  { field: "logoLightUrl", role: "logo" },
  { field: "logoDarkUrl", role: "logo" },
  { field: "bannerUrl", role: "cardBackdrop" },
  { field: "personImageUrl", role: "person" },
  { field: "cardScreenshotUrl", role: "cardBackdrop" },
  { field: "featuredCoinImageUrl", role: "coin" },
];

type Job = {
  table: "partner" | "viewerWin";
  id: string;
  field: string;
  role: UploadRole;
  oldUrl: string;
  filename: string;
};

function kb(bytes: number) {
  return `${Math.round(bytes / 1024)} КБ`;
}

async function collectJobs(): Promise<Job[]> {
  const jobs: Job[] = [];

  const partners = await prisma.partner.findMany();
  for (const partner of partners) {
    for (const { field, role } of PARTNER_FIELDS) {
      const value = (partner as unknown as Record<string, string | null>)[field];
      if (!value?.startsWith(UPLOAD_PREFIX)) continue;
      jobs.push({
        table: "partner",
        id: partner.id,
        field,
        role,
        oldUrl: value,
        filename: value.slice(UPLOAD_PREFIX.length),
      });
    }
  }

  const wins = await prisma.viewerWin.findMany();
  for (const win of wins) {
    if (!win.screenshotUrl.startsWith(UPLOAD_PREFIX)) continue;
    jobs.push({
      table: "viewerWin",
      id: win.id,
      field: "screenshotUrl",
      role: "viewerWin",
      oldUrl: win.screenshotUrl,
      filename: win.screenshotUrl.slice(UPLOAD_PREFIX.length),
    });
  }

  return jobs;
}

async function main() {
  const jobs = await collectJobs();
  console.log(`Файлов в базе: ${jobs.length}${APPLY ? "" : "  (режим просмотра, --apply чтобы выполнить)"}\n`);

  let before = 0;
  let after = 0;
  let converted = 0;
  const referenced = new Set<string>();

  if (APPLY) await mkdir(ORIGINALS_DIR, { recursive: true });

  for (const job of jobs) {
    referenced.add(job.filename);
    const source = path.join(UPLOAD_DIR, job.filename);

    let raw: Buffer;
    try {
      raw = await readFile(source);
    } catch {
      console.log(`  ⚠ нет файла: ${job.filename}`);
      continue;
    }

    let optimized;
    try {
      optimized = await optimizeUploadImage(raw, job.role);
    } catch (error) {
      console.log(`  ⚠ не смог обработать ${job.filename}: ${String(error)}`);
      continue;
    }

    before += raw.byteLength;

    if (optimized.data.byteLength >= raw.byteLength) {
      after += raw.byteLength;
      console.log(`  = ${job.filename} — уже оптимален (${kb(raw.byteLength)})`);
      continue;
    }

    after += optimized.data.byteLength;
    converted += 1;

    const base = job.filename.replace(/\.[^.]+$/, "");
    const newFilename = `${base}.webp`;
    const newUrl = `${UPLOAD_PREFIX}${newFilename}`;

    const saved = Math.round((1 - optimized.data.byteLength / raw.byteLength) * 100);
    console.log(
      `  ✓ ${job.filename}: ${kb(raw.byteLength)} → ${kb(optimized.data.byteLength)} (−${saved}%, ${optimized.width}×${optimized.height}, ${job.role})`,
    );

    if (!APPLY) continue;

    await writeFile(path.join(UPLOAD_DIR, newFilename), optimized.data);

    if (job.table === "partner") {
      await prisma.partner.update({
        where: { id: job.id },
        data: { [job.field]: newUrl },
      });
    } else {
      await prisma.viewerWin.update({
        where: { id: job.id },
        data: { screenshotUrl: newUrl },
      });
    }

    if (newFilename !== job.filename) {
      await rename(source, path.join(ORIGINALS_DIR, job.filename));
    } else {
      // Имя не поменялось (файл уже был .webp) — оригинал сохраняем копией.
      await writeFile(path.join(ORIGINALS_DIR, job.filename), raw);
      await writeFile(path.join(UPLOAD_DIR, newFilename), optimized.data);
    }
  }

  console.log(
    `\nИтого по используемым картинкам: ${kb(before)} → ${kb(after)} (обработано ${converted})`,
  );

  const allFiles = await readdir(UPLOAD_DIR);
  let orphanBytes = 0;
  let orphanCount = 0;
  for (const name of allFiles) {
    if (referenced.has(name)) continue;
    if (name.endsWith(".webp") && referenced.has(name)) continue;
    const info = await stat(path.join(UPLOAD_DIR, name));
    if (!info.isFile()) continue;
    orphanBytes += info.size;
    orphanCount += 1;
  }
  console.log(
    `Не используется ни одним проектом: ${orphanCount} файлов, ${kb(orphanBytes)} (не трогаю)`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
