import { mkdir, writeFile } from "fs/promises";
import path from "path";

type TelegramChat = {
  first_name?: string;
  last_name?: string;
  username?: string;
  photo?: {
    big_file_id?: string;
    small_file_id?: string;
  };
};

type TelegramProfilePhotos = {
  photos?: Array<Array<{ file_id?: string }>>;
};

export type TelegramProfile = {
  userId: string;
  username: string | null;
  displayName: string | null;
  photoUrl: string | null;
};

async function downloadTelegramPhoto(
  token: string,
  fileId: string,
  userId: string,
) {
  const fileRes = await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`,
  );
  const fileData = (await fileRes.json()) as {
    ok?: boolean;
    result?: { file_path?: string };
  };
  if (!fileData.ok || !fileData.result?.file_path) return null;

  const fileUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
  const imgRes = await fetch(fileUrl);
  if (!imgRes.ok) return null;

  const ext = fileData.result.file_path.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const uploadDir = path.join(process.cwd(), "public", "uploads", "telegram-avatars");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${userId}.${safeExt === "jpeg" ? "jpg" : safeExt}`;
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/telegram-avatars/${filename}`;
}

async function fetchProfilePhotoFileId(token: string, userId: string) {
  const photosRes = await fetch(
    `https://api.telegram.org/bot${token}/getUserProfilePhotos?user_id=${encodeURIComponent(userId)}&limit=1`,
  );
  const photosData = (await photosRes.json()) as {
    ok?: boolean;
    result?: TelegramProfilePhotos;
  };
  if (!photosData.ok) return null;

  const sizes = photosData.result?.photos?.[0];
  if (!sizes?.length) return null;

  return sizes[sizes.length - 1]?.file_id ?? null;
}

export async function fetchTelegramProfileByUserId(
  rawUserId: string,
): Promise<TelegramProfile> {
  const userId = rawUserId.trim();
  if (!/^\d+$/.test(userId)) {
    return { userId: "", username: null, displayName: null, photoUrl: null };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return { userId, username: null, displayName: null, photoUrl: null };
  }

  try {
    const chatRes = await fetch(
      `https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(userId)}`,
    );
    const chatData = (await chatRes.json()) as {
      ok?: boolean;
      result?: TelegramChat;
    };

    if (!chatData.ok || !chatData.result) {
      return { userId, username: null, displayName: null, photoUrl: null };
    }

    const chat = chatData.result;
    const displayName =
      [chat.first_name, chat.last_name].filter(Boolean).join(" ").trim() || null;
    const username = chat.username?.trim() || null;

    const chatFileId = chat.photo?.big_file_id ?? chat.photo?.small_file_id;
    const fileId = chatFileId ?? (await fetchProfilePhotoFileId(token, userId));
    const photoUrl = fileId
      ? await downloadTelegramPhoto(token, fileId, userId)
      : null;

    return { userId, username, displayName, photoUrl };
  } catch (error) {
    console.error("[telegram-profile]", error);
    return { userId, username: null, displayName: null, photoUrl: null };
  }
}
