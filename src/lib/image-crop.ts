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

export type ImageLayout = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

export function getObjectContainLayout(
  frameWidth: number,
  frameHeight: number,
  imageWidth: number,
  imageHeight: number,
): ImageLayout | null {
  if (!frameWidth || !frameHeight || !imageWidth || !imageHeight) return null;

  const scale = Math.min(frameWidth / imageWidth, frameHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    offsetX: (frameWidth - width) / 2,
    offsetY: (frameHeight - height) / 2,
    width,
    height,
  };
}

export function cropToOverlayPixels(crop: CropRect, layout: ImageLayout) {
  return {
    left: layout.offsetX + crop.x * layout.width,
    top: layout.offsetY + crop.y * layout.height,
    width: crop.w * layout.width,
    height: crop.h * layout.height,
  };
}

export function clampCrop(crop: CropRect): CropRect {
  const w = Math.min(1, Math.max(0.01, crop.w));
  const h = Math.min(1, Math.max(0.01, crop.h));
  const x = Math.min(1 - w, Math.max(0, crop.x));
  const y = Math.min(1 - h, Math.max(0, crop.y));
  return { x, y, w, h };
}

export const MIN_CROP_ZOOM = 1;
export const MAX_CROP_ZOOM = 4;

export function cropAspectOnImage(
  crop: CropRect,
  imageWidth: number,
  imageHeight: number,
) {
  if (!imageWidth || !imageHeight) return CROP_ASPECT;
  const imageAspect = imageWidth / imageHeight;
  return (crop.w * imageAspect) / crop.h;
}

export function isCrop16x9OnImage(
  crop: CropRect,
  imageWidth: number,
  imageHeight: number,
  tolerance = 0.01,
) {
  return (
    Math.abs(cropAspectOnImage(crop, imageWidth, imageHeight) - CROP_ASPECT) <=
    tolerance
  );
}

export function maxCrop16x9(imageWidth: number, imageHeight: number) {
  return defaultCrop16x9(imageWidth, imageHeight);
}

export function cropZoomLevel(
  crop: CropRect,
  imageWidth: number,
  imageHeight: number,
) {
  const base = maxCrop16x9(imageWidth, imageHeight);
  if (!base.w || !crop.w) return MIN_CROP_ZOOM;
  return Math.min(MAX_CROP_ZOOM, Math.max(MIN_CROP_ZOOM, base.w / crop.w));
}

export function applyCropZoom(
  crop: CropRect,
  imageWidth: number,
  imageHeight: number,
  zoom: number,
) {
  const base = maxCrop16x9(imageWidth, imageHeight);
  const z = Math.min(MAX_CROP_ZOOM, Math.max(MIN_CROP_ZOOM, zoom));
  const w = base.w / z;
  const h = base.h / z;
  const centerX = crop.x + crop.w / 2;
  const centerY = crop.y + crop.h / 2;

  return clampCrop({
    x: centerX - w / 2,
    y: centerY - h / 2,
    w,
    h,
  });
}

/** Fix legacy crops that used DEFAULT_CROP h=0.5625 on portrait photos. */
export function reconcileCrop(
  crop: CropRect,
  imageWidth: number,
  imageHeight: number,
) {
  if (isCrop16x9OnImage(crop, imageWidth, imageHeight)) {
    return clampCrop(crop);
  }

  const base = maxCrop16x9(imageWidth, imageHeight);
  return clampCrop({
    x: crop.x,
    y: crop.y,
    w: base.w,
    h: base.h,
  });
}

/** 16:9 crop region filling a 16:9 viewport — matches the admin overlay frame. */
export function cropToImgStyles(crop: CropRect, imageAspect: number) {
  const w = Math.max(0.01, crop.w);
  const widthPct = 100 / w;
  const leftPct = (-crop.x / w) * 100;
  const topPct = (-crop.y * CROP_ASPECT) / (w * imageAspect) * 100;

  return {
    width: `${widthPct}%`,
    height: "auto" as const,
    maxWidth: "none" as const,
    left: `${leftPct}%`,
    top: `${topPct}%`,
  };
}

function parseWinDigits(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const value = Number.parseInt(digits, 10);
  return Number.isNaN(value) ? null : value;
}

function formatSpaceThousands(value: number) {
  return value.toLocaleString("ru-RU").replace(/\u00A0/g, " ");
}

export function formatWinMultiplier(raw: string | null | undefined) {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;
  const value = parseWinDigits(trimmed.replace(/^x/i, ""));
  if (value === null) return null;
  return `x${formatSpaceThousands(value)}`;
}

export function formatWinAmount(raw: string | null | undefined) {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;
  const value = parseWinDigits(trimmed);
  if (value === null) return null;
  return `${formatSpaceThousands(value)}₽`;
}
