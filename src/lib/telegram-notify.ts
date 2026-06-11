import { telegramDisplayName } from "@/lib/telegram-url";

function adminChatId() {
  return (
    process.env.TELEGRAM_ADMIN_CHAT_ID?.trim() ||
    process.env.TELEGRAM_ADMIN_USER_ID?.trim() ||
    "8233307353"
  );
}

function botToken() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
}

export function formatWinSubmissionContact(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const digits = trimmed.replace(/\D/g, "");
  if (/^\+?\d[\d\s()-]{6,}$/.test(trimmed) && digits.length >= 7) {
    return trimmed.replace(/\s+/g, " ");
  }

  return telegramDisplayName(trimmed);
}

export async function sendWinSubmissionToAdmin(params: {
  contact: string;
  winDate: string;
  partnerName: string;
  slotName: string;
  photo: Buffer;
  filename: string;
  mimeType: string;
}) {
  const token = botToken();
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const contactLabel = formatWinSubmissionContact(params.contact);
  const caption = [
    `${params.winDate.trim()} ${contactLabel}`.trim(),
    params.partnerName.trim(),
    params.slotName.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  const body = new FormData();
  body.append("chat_id", adminChatId());
  body.append("caption", caption);
  body.append(
    "photo",
    new Blob([Uint8Array.from(params.photo)], { type: params.mimeType }),
    params.filename,
  );

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body,
  });

  const data = (await res.json()) as { ok?: boolean; description?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.description ?? "Telegram sendPhoto failed");
  }
}
