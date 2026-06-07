export type CropRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export const CROP_ASPECT = 16 / 9;

export const DEFAULT_CROP: CropRect = {
  x: 0,
  y: 0,
  w: 1,
  h: 0.5625,
};

export function defaultCrop16x9(imageWidth: number, imageHeight: number): CropRect {
  if (imageWidth <= 0 || imageHeight <= 0) return DEFAULT_CROP;

  const imageAspect = imageWidth / imageHeight;

  if (imageAspect > CROP_ASPECT) {
    const h = 1;
    const w = (CROP_ASPECT * imageHeight) / imageWidth;
    return { x: (1 - w) / 2, y: 0, w, h };
  }

  const w = 1;
  const h = imageWidth / CROP_ASPECT / imageHeight;
  return { x: 0, y: (1 - h) / 2, w, h };
}

export function clampCrop(crop: CropRect): CropRect {
  const w = Math.min(1, Math.max(0.01, crop.w));
  const h = Math.min(1, Math.max(0.01, crop.h));
  const x = Math.min(1 - w, Math.max(0, crop.x));
  const y = Math.min(1 - h, Math.max(0, crop.y));
  return { x, y, w, h };
}

function parseWinDigits(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const value = Number.parseInt(digits, 10);
  return Number.isNaN(value) ? null : value;
}

function formatDotThousands(value: number) {
  return value.toLocaleString("de-DE");
}

export function formatWinMultiplier(raw: string | null | undefined) {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;
  const value = parseWinDigits(trimmed.replace(/^x/i, ""));
  if (value === null) return null;
  return `x${formatDotThousands(value)}`;
}

export function formatWinAmount(raw: string | null | undefined) {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;
  const value = parseWinDigits(trimmed);
  if (value === null) return null;
  return `${formatDotThousands(value)}₽`;
}
