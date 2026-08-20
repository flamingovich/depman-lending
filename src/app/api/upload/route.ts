import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import {
  optimizeUploadImage,
  resolveUploadRole,
} from "@/lib/process-upload-image";
import {
  formatMegabytes,
  MAX_LOGO_UPLOAD_BYTES,
  MAX_PERSON_UPLOAD_BYTES,
} from "@/lib/upload-limits";
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/x-png",
  "image/webp",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
]);

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName === "webp") return "webp";
  if (fromName === "png") return "png";
  if (fromName === "jpg" || fromName === "jpeg") return "jpg";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/jpeg") return "jpg";
  return "png";
}

function isAllowedImage(file: File) {
  if (ALLOWED_TYPES.has(file.type)) return true;
  return /\.(png|webp|jpe?g)$/i.test(file.name);
}

function safePrefix(raw: string) {
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  return cleaned.slice(0, 40) || "logo";
}

export async function POST(request: Request) {
  try {
    await requireSession();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
    }

    if (!isAllowedImage(file)) {
      return NextResponse.json(
        { error: "Допустимы PNG, JPG и WebP" },
        { status: 400 },
      );
    }

    const variant = String(formData.get("variant") ?? "");
    const isPerson = variant === "person";
    const isScreenshot = variant === "screenshot";
    const maxBytes =
      isPerson || isScreenshot ? MAX_PERSON_UPLOAD_BYTES : MAX_LOGO_UPLOAD_BYTES;

    if (isPerson && file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
      return NextResponse.json(
        { error: "Для фото на баннере загрузите PNG с прозрачностью" },
        { status: 400 },
      );
    }

    if (file.size > maxBytes) {
      const limit = formatMegabytes(maxBytes);
      return NextResponse.json(
        { error: `Максимальный размер файла — ${limit}` },
        { status: 400 },
      );
    }

    const prefix = safePrefix(String(formData.get("prefix") ?? "logo"));
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");

    await mkdir(uploadDir, { recursive: true });

    const raw = Buffer.from(await file.arrayBuffer());

    // Ужимаем всё, что грузит админка: сырые PNG со скриншотов весят мегабайты
    // и раньше уезжали пользователю как есть.
    let data: Uint8Array = raw;
    let ext = fileExtension(file);

    try {
      const optimized = await optimizeUploadImage(
        raw,
        resolveUploadRole(variant, prefix),
      );
      data = optimized.data;
      ext = optimized.ext;
    } catch (error) {
      console.error("[upload] optimize failed, saving original", error);
    }

    const filename = `${prefix}-${Date.now()}.${ext}`;
    await writeFile(path.join(uploadDir, filename), data);

    return NextResponse.json({ url: `/uploads/logos/${filename}` });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[upload]", error);
    return NextResponse.json(
      { error: "Не удалось сохранить файл на сервере." },
      { status: 500 },
    );
  }
}
