import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";
import { sendWinSubmissionToAdmin } from "@/lib/telegram-notify";
import { MAX_PERSON_UPLOAD_BYTES, formatMegabytes } from "@/lib/upload-limits";
import { normalizeTelegramUsername } from "@/lib/telegram-url";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/x-png",
  "image/webp",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
]);

function isAllowedImage(file: File) {
  if (ALLOWED_TYPES.has(file.type)) return true;
  return /\.(png|webp|jpe?g)$/i.test(file.name);
}

function fileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName === "webp") return "webp";
  if (fromName === "png") return "png";
  if (fromName === "jpg" || fromName === "jpeg") return "jpg";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/jpeg") return "jpg";
  return "png";
}

function validateContact(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false as const, error: "Укажите Telegram или номер телефона" };

  const digits = trimmed.replace(/\D/g, "");
  if (/^\+?\d[\d\s()-]{6,}$/.test(trimmed) && digits.length >= 7) {
    return { ok: true as const, value: trimmed.replace(/\s+/g, " ") };
  }

  const username = normalizeTelegramUsername(trimmed);
  if (!username || !/^[a-zA-Z0-9_]{4,32}$/.test(username)) {
    return { ok: false as const, error: "Укажите @username или номер телефона" };
  }

  return { ok: true as const, value: username };
}

function formatWinDate(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false as const, error: "Укажите дату заноса" };

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-");
    return { ok: true as const, value: `${day}.${month}.${year}` };
  }

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    return { ok: true as const, value: trimmed };
  }

  return { ok: false as const, error: "Дата в формате ДД.ММ.ГГГГ" };
}

const bodySchema = z.object({
  contact: z.string().min(1),
  partnerId: z.string().min(1),
  winDate: z.string().min(1),
  slotName: z.string().min(1),
});

const SUBMIT_LIMIT = 3;
const SUBMIT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const limit = checkRateLimit(
      `win-submit:${clientIp(request)}`,
      SUBMIT_LIMIT,
      SUBMIT_WINDOW_MS,
    );
    if (!limit.ok) {
      return tooManyRequests(
        "Слишком много заявок подряд. Попробуйте через несколько минут.",
        limit.retryAfterSeconds,
      );
    }

    const formData = await request.formData();
    const file = formData.get("screenshot");
    const parsed = bodySchema.safeParse({
      contact: String(formData.get("contact") ?? ""),
      partnerId: String(formData.get("partnerId") ?? ""),
      winDate: String(formData.get("winDate") ?? ""),
      slotName: String(formData.get("slotName") ?? ""),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
    }

    const slotName = parsed.data.slotName.trim();
    if (slotName.length < 2) {
      return NextResponse.json({ error: "Укажите название слота" }, { status: 400 });
    }

    const contactResult = validateContact(parsed.data.contact);
    if (!contactResult.ok) {
      return NextResponse.json({ error: contactResult.error }, { status: 400 });
    }

    const dateResult = formatWinDate(parsed.data.winDate);
    if (!dateResult.ok) {
      return NextResponse.json({ error: dateResult.error }, { status: 400 });
    }

    const partner = await prisma.partner.findFirst({
      where: {
        id: parsed.data.partnerId,
        isActive: true,
        kind: { not: "channel" },
      },
      select: { name: true },
    });

    if (!partner) {
      return NextResponse.json({ error: "Выберите проект из списка" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Прикрепите скрин заноса" }, { status: 400 });
    }

    if (!isAllowedImage(file)) {
      return NextResponse.json(
        { error: "Скрин — PNG, JPG или WebP" },
        { status: 400 },
      );
    }

    if (file.size > MAX_PERSON_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `Максимальный размер файла — ${formatMegabytes(MAX_PERSON_UPLOAD_BYTES)}` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = fileExtension(file);
    const mimeType = file.type || `image/${ext === "jpg" ? "jpeg" : ext}`;

    await sendWinSubmissionToAdmin({
      contact: contactResult.value,
      winDate: dateResult.value,
      partnerName: partner.name,
      slotName,
      photo: buffer,
      filename: `win-${Date.now()}.${ext}`,
      mimeType,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[viewer-wins/submit]", error);
    return NextResponse.json(
      { error: "Не удалось отправить занос. Попробуйте позже." },
      { status: 500 },
    );
  }
}
