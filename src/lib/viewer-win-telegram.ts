import { fetchTelegramProfileByUserId } from "@/lib/telegram-profile";

export async function resolveViewerWinTelegram(rawUserId: string) {
  const userId = rawUserId.trim();
  if (!/^\d+$/.test(userId)) return null;

  const profile = await fetchTelegramProfileByUserId(userId);
  if (!profile.userId) return null;

  return {
    telegramUserId: profile.userId,
    telegramUsername: profile.username,
    telegramDisplayName: profile.displayName,
    telegramPhotoUrl: profile.photoUrl,
  };
}
