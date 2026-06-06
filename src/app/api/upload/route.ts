import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { processPersonImage } from "@/lib/process-person-image";

const MAX_BYTES = 2 * 1024 * 1024;
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

    if (isPerson && file.type === "image/webp") {
      return NextResponse.json(
        {
          error:
            "Для фото на баннере используйте PNG с прозрачностью (WebP пока не поддерживается)",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Максимальный размер файла — 2 МБ" },
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
    const output = isPerson ? await processPersonImage(raw) : raw;

    await writeFile(path.join(uploadDir, filename), output);

    return NextResponse.json({ url: `/uploads/logos/${filename}` });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[upload]", error);
    const message =
      error instanceof Error && error.message.includes("decoding")
        ? "Не удалось прочитать файл. Загрузите PNG с прозрачностью."
        : "Не удалось загрузить файл. Попробуйте PNG до 2 МБ.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
