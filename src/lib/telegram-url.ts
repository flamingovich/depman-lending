export function normalizeTelegramUsername(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const withoutAt = trimmed.replace(/^@+/, "");
  const fromUrl = withoutAt.replace(/^https?:\/\/(t\.me|telegram\.me)\//i, "");
  return fromUrl.split(/[/?#]/)[0]?.trim() ?? "";
}

export function telegramProfileUrl(raw: string) {
  const username = normalizeTelegramUsername(raw);
  return username ? `https://t.me/${username}` : "";
}

export function telegramDisplayName(raw: string) {
  const username = normalizeTelegramUsername(raw);
  return username ? `@${username}` : raw.trim();
}

export function telegramContactUrl(userId: string, username?: string | null) {
  const normalized = username ? normalizeTelegramUsername(username) : "";
  if (normalized) return `https://t.me/${normalized}`;
  if (/^\d+$/.test(userId.trim())) return `tg://user?id=${userId.trim()}`;
  return "";
}
