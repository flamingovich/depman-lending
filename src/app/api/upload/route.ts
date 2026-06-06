import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import {
  formatMegabytes,
  MAX_LOGO_UPLOAD_BYTES,
  MAX_PERSON_UPLOAD_BYTES,
} from "@/lib/upload-limits";
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/x-png",
  "image/webp",
]);

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName === "webp") return "webp";
  if (fromName === "png") return "png";
  if (file.type === "image/webp") return "webp";
  return "png";
}

function isAllowedImage(file: File) {
  if (ALLOWED_TYPES.has(file.type)) return true;
  return /\.(png|webp)$/i.test(file.name);
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
        { error: "Допустимы только PNG и WebP" },
        { status: 400 },
      );
    }

    const variant = String(formData.get("variant") ?? "");
    const isPerson = variant === "person";

    if (isPerson && file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
      return NextResponse.json(
        { error: "Для фото на баннере загрузите PNG с прозрачностью" },
        { status: 400 },
      );
    }

    if (file.size > (isPerson ? MAX_PERSON_UPLOAD_BYTES : MAX_LOGO_UPLOAD_BYTES)) {
      const limit = formatMegabytes(
        isPerson ? MAX_PERSON_UPLOAD_BYTES : MAX_LOGO_UPLOAD_BYTES,
      );
      return NextResponse.json(
        { error: `Максимальный размер файла — ${limit}` },
        { status: 400 },
      );
    }

    const ext = fileExtension(file);
    const prefix = safePrefix(String(formData.get("prefix") ?? "logo"));
    const filename = isPerson
      ? `${prefix}-${Date.now()}.png`
      : `${prefix}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");

    await mkdir(uploadDir, { recursive: true });

    const raw = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), raw);

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
